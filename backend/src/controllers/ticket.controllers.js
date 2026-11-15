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
  if (order) {
    throw new ApiError(404, "order is not found");
  }
  if (order.Status === "PAID") {
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
    _id: { $in: { seatId }, event: { eventId } },
  });

  if (seatCount !== seatId.length) {
    throw new ApiError(400, "some seat do not exit for this event");
  }
});
