import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Ticket } from "../model/ticket.model.js";
import { Order } from "../model/order.model.js";
import { Event } from "../model/event.model.js";
import mongoose from "mongoose";
import { Seat } from "../model/seat.model.js";

const createTicket = asynchandler(async (req, res) => {
  const { eventId, orderId, seatId } = req.body;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order id is not correct from");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  if (
    !Array.isArray(seatId) ||
    seatId.length === 0 ||
    !seatId.every((id) => mongoose.isValidObjectId(id))
  ) {
    throw new ApiError(400, "seat id is must be vaild id");
  }
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "order is not found");
  }
  if (order.Status !== "PAID") {
    throw new ApiError(400, "order must be paid before creating tickets");
  }
  if (order.customer?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to use this order");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "event not found");
  }
  if (event.Status === "CANCELLED") {
    throw new ApiError(400, "sorry event is cancelled");
  }
  // one order create for one ticket
  const alreadyIssued = await Ticket.exists({ orderId });
  if (alreadyIssued) {
    throw new ApiError(409, "tickets are already created for this order");
  }

  const seatCount = await Seat.countDocuments({
    _id: { $in: seatId },
    eventId: eventId,
  });

  if (seatCount !== seatId.length) {
    throw new ApiError(400, "some seat do not exit for this event");
  }
  const session = await mongoose.startSession();
  let tickets;
  try {
    await session.withTransaction(async () => {
      const result = await Seat.updateMany(
        {
          _id: { $in: seatId },
          eventId: eventId,
          Status: { $ne: "SOLD" },
        },
        { $set: { Status: "SOLD" } },
        { session },
      );

      if (result.modifiedCount !== seatId.length) {
        throw new ApiError(409, "one or more seats are already sold");
      }

      tickets = await Ticket.insertMany(
        seatId.map((seatIds) => ({
          eventId,
          seatId: seatIds,
          orderId,
        })),
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return res
    .status(201)
    .json(new ApiResponse(201, tickets, "tickets create successfully"));
});

const getTicketById = asynchandler(async (req, res) => {
  const { ticketId } = req.params;
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new ApiError(400, "tickets id not correct from");
  }
  const ticket = await Ticket.findById(ticketId)
    .populate("seatId")
    .populate("eventId")
    .populate("orderId");

  if (!ticket) {
    throw new ApiError(404, "ticket not found");
  }

  //only buyer and owner see tickets
  const buyer =
    ticket.orderId?.customer?.toString() === req.user?._id.toString();

  const owner = ticket.eventId?.user?.toString() === req.user?._id.toString();

  if (!buyer && !owner) {
    throw new ApiError(403, "you are not authorised to see this tickets");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "ticket get successfully"));
});

const getTicketByOrderId = asynchandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "order id is not correct from");
  }
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "order not found");
  }
  if (order.customer?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you are not authorised to view this ticket");
  }
  const tickets = await Ticket.find({ orderId })
    .populate("seatId")
    .populate("eventId");

  res
    .status(200)
    .json(new ApiResponse(200, tickets, "tickets get successfully"));
});

const getTicketByEventId = asynchandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "event id is not corrcet form");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(400, "event not found");
  }

  if (event.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you are not authorised to view this ticket");
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

  const filter = { eventId: eventId };
  if (req.query.checkedIn === "true") filter.checkedInAt = { $ne: null };
  if (req.query.checkedIn === "false") filter.checkedInAt = null;

  const tickets = await Ticket.find(filter)
    .populate("seatId")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totel = await Ticket.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        totel,
        pages: Math.ceil(totel / limit),
        tickets,
      },
      "tickets get successfully",
    ),
  );
});

//only event owner can check in tickets

const checkInTickets = asynchandler(async (req, res) => {
  const { code } = req.body;

  if (!code || code.trim() === "") {
    throw new ApiError(404, "invaild ticket code");
  }

  const ticket = await Ticket.findOne({ code: code.trim() }).populate(
    "eventId",
  );
  if (ticket.eventId?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError("409", "you can not authorised to check in this ticket");
  }

  if (ticket.eventId.Status === "CANCELLED") {
    throw new ApiError(409, "event is cancelled");
  }

  //can not check in the same ticket twice
  const checkedInTicket = await Ticket.findOneAndUpdate(
    {
      _id: ticket._id,
      checkedInAt: null,
    },
    { $set: { checkedInAt: new Date() } },
    { new: true },
  );
  if (!checkedInTicket) {
    throw new ApiError(409, "ticket already checked in");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "ticket check in successfully"));
});

//delete ticket means delete ticket and realse seat
const deleteTicket = asynchandler(async (req, res) => {
  const { ticketId } = req.params;

  if (!mongoose.isValidObjectId(ticketId)) {
    throw new ApiError(400, "ticket id is not corrcet form");
  }
  const ticket = await Ticket.findById(ticketId)
    .populate("orderId")
    .populate("eventId");
  if (!ticket) {
    throw new ApiError(404, "ticket you want to delete not found");
  }

  const isBuyer =
    ticket.orderId?.customer?.toString() === req.user?._id.toString();

  const isOwner = ticket.eventId?.user?.toString() === req.user?._id.toString();

  if (!isBuyer && !isOwner) {
    throw new ApiError(403, "you can not authorised to delete this ticket");
  }
  if (ticket.checkedInAt) {
    throw new ApiError(400, "checked in ticket can not be deleted");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Ticket.deleteOne({ _id: ticket._id }, { session });
      await Seat.updateOne(
        { _id: ticket.seatId },
        { $set: { Status: "AVAILABLE" } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "ticket delete successfully"));
});

export {
  createTicket,
  getTicketByEventId,
  getTicketByOrderId,
  getTicketById,
  deleteTicket,
  checkInTickets,
};
