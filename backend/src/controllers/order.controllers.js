import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";
import { Seat } from "../model/seat.model.js";
import { Order } from "../model/order.model.js";
import { Event } from "../model/event.model.js";
import { Ticket } from "../model/ticket.model.js";
//POST /orders
//body {eventId,seatId:[]}
//Holds the seats (available -> held) and create a pandding order
//price never be taken from client

const createOrder = asynchandler(async (req, res) => {
  const { eventId, seatId } = req.body;
  if (!mongoose.isValidObjectId | eventId) {
    throw new ApiError(400, "event id is not corrcet form");
  }
  if (
    !Array.isArray(seatId) ||
    seatId.length === 0 ||
    !seatId.map((id) => mongoose.isValidObjectId(id))
  ) {
    throw new ApiError(400, "seatIds must be a list of vaild ids");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "event not found");
  }

  if (event.Status === "CANCELLED") {
    throw new ApiError(400, "event is cancelled");
  }

  // find returns each seat only once, so duplicate ids are caught here too
  const seats = await Seat.find({ _id: { $in: seatId }, eventId });

  if (seats.length !== seatId.length) {
    throw new ApiError(400, "some seats do not exits for this event");
  }

  if (seats.some((seat) => seat.Status !== "AVAILABLE")) {
    throw new ApiError(409, "one or more seats are not available");
  }

  const totelAmmout = seats.reduce((sum, seat) => sum + seat.price, 0);

  const session = await mongoose.startSession();

  let order;
  try {
    await session.withTransaction(async () => {
      const result = await Seat.updateMany(
        { _id: { $in: seatId }, eventId, Status: "AVAILABLE" },
        { $set: { Status: "HELD" } },
        { session },
      );

      if (result.modifiedCount !== seatId.length) {
        throw new ApiError(409, "one or more seats are not available");
      }

      const order = await Order.create(
        [
          {
            customer: req.user?._id,
            eventId,
            seats: seatId,
            totelAmmout,
          },
        ],
        { session },
      );
      order = created[0];
    });
  } finally {
    await session.endSession();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order successfully created"));
});

// PATCH /orders/:orderId/pay
// PENDING -> PAID
// NOTE: this is a placeholder. With a real gateway (Razorpay, Stripe) the status
// must be set to PAID only after verifying the gateway's webhook / signature.
const payOrder = asynchandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order id is not correct form");
  }
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "order not found");
  }
  if (order.customer?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to pay this order");
  }
  if (order.Status !== "PANDDING") {
    throw new ApiError(400, `order is already ${order.Status.toLowerCase()}`);
  }

  const paidOrder = await Order.findByIdAndUpdate(
    {
      _id: orderId,
      Status: "PANDDING",
    },
    { $set: { Status: "PAID" } },
    { new: true },
  );
  if (!paidOrder) {
    throw new ApiError(409, "order status changed,please try again");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, paidOrder, "order paid successfully"));
});

const getOrderById = asynchandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order id is not corrcet form");
  }
  const order = await Order.findById(orderId)
    .populate("eventId")
    .populate("seatId");
  if (!order) {
    throw new ApiError(404, "order not found");
  }
  if (order.customer?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to veiw this order");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order get successfully "));
});
// PATCH /orders/:orderId/refund
// only the event owner can refund. PAID -> REFUNDED, tickets deleted, seats released.
// NOTE: this does not send money back, call the payment gateway refund API separately.

const refundedOrder = asynchandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order is is not correct from");
  }
  const order = await Order.findById(orderId).populate("eventId");
  if (!order) {
    throw new ApiError(400, "order not found");
  }
  if (order.eventId?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to refund this order");
  }

  if (order.Status !== "PAID") {
    throw new ApiError(400, "only paid order can be refunded");
  }
  const usedTicket = await Ticket.exists({
    orderId,
    checkedInAt: { $ne: null },
  });
  if (usedTicket) {
    throw new ApiError(400, "order has checked in tickets,can not be refund");
  }
  const session = await mongoose.startSession();
  let refundedOrder;

  try {
    await session.withTransaction(async () => {
      refundedOrder = await Order.findOneAndUpdate(
        { _id: orderId, Status: "PAID" },
        { $set: { Status: "REFUNDED" } },
        { new: true, session },
      );

      if (!refundedOrder) {
        throw new ApiError(409, "order status change please try again");
      }
      await Ticket.deleteMany({ orderId }, { session });
      await Seat.updateMany(
        { _id: { $in: order.seats } },
        { $set: { Status: "AVAILABLE" } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return res.status(200, refundedOrder, "order refund successfully");
});

// PENDING -> CANCELLED and the held seats go back to AVAILABLE
const cancelOrder = asynchandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order id is not correct from");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(400, "order not found");
  }
  if (order.customer?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to cancelSeat this order");
  }

  if (order.Status !== "PANDDING") {
    throw new ApiError(
      400,
      "only padding order can be cancel,paid order need refund",
    );
  }
  const session = await mongoose.startSession();
  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      cancelledOrder = await Order.findByIdAndDelete(
        { _id: orderId, Status: "PANDDING" },
        { $set: { Status: "CANCELLED" } },
        { new: true, session },
      );

      if (!cancelledOrder) {
        throw new ApiError(400, "order status changed,please try again");
      }
      await Seat.updateMany(
        { _id: { $in: order.seats }, Status: "HELD" },
        { $set: { Status: "AVAILABLE" } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cancelledOrder, "order cancel successfully"));
});
const getMyOrders = asynchandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = { customer: req.user?._id };
  const allowed = ["PANDDING", "PAID", "CANCELLED", "REFUNDED"];
  if (req.query.status && allowed.includes(req.query.status.toUpperCase())) {
    filter.Status = req.query.status.toUpperCase();
  }
  const orders = await Order.find(filter)
    .populate("eventId", "name city")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totel = await Order.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { page, totel, pages: Math.ceil(totel / limit), orders },
        "orders get successfully",
      ),
    );
});

export {
  createOrder,
  payOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  refundedOrder,
};
