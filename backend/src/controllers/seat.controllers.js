import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import { Seat } from "../model/seat.model.js";
import mongoose from "mongoose";
import { Event } from "../model/event.model.js";

const SEAT_STATUS = ["AVAILABLE", "HELD", "SOLD"];
// body: { eventId, seats: [{ section, rows, number, price }, ...] }
// only the event owner can add seats. All seats are saved, or none (transaction).
// Note: transactions need MongoDB running as a replica set (Atlas has this by default).

const createSeat = asynchandler(async (req, res) => {
  const { eventId, seats } = req.body;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiResponse(400, "event id is not correct from");
  }

  if (Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(400, "seats must be none empty list");
  }

  if (seats.length > 500) {
    throw new ApiError(400, "you can add maximum 500 seats at one time");
  }
});

// used by the frontend to draw the seat map (returns every seat of the event)

const getSeatByevent = asynchandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiResponse(400, "event id is not correct from");
  }
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "event not found");
  }

  const filter = { eventId };
  if (req.query.section && typeof req.query.section === "string") {
    filter.section = req.query.section.trim();
  }
  if (
    req.query.status &&
    SEAT_STATUS.includes(String(req.query.status).toUpperCase())
  ) {
    filter.Status = String(req.query.status).toUpperCase();
  }

  const seats = await Seat.find(filter)
    .sort({
      section: 1,
      rows: 1,
      number: 1,
    })
    .limit(1000);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totel: seats.length, seats },
        "seats get successfully",
      ),
    );
});

const getSeatById = asynchandler(async (req, res) => {
  const { seatId } = req.params;
  if (!mongoose.isValidObjectId(seatId)) {
    throw new ApiError(400, "seat id is not correct from");
  }

  const seat = await Seat.findById(seatId).populate("eventId", "name city");

  if (!seat) {
    throw new ApiResponse(404, "seat not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, seat, "seat get successfully"));
});

//only event owner can be delete seat (Status => pandding)

const deleteSeat = asynchandler(async (req, res) => {
  const { seatId } = req.params;

  if (!mongoose.isValidObjectId(seatId)) {
    throw new ApiError(400, "seat id is not correct from");
  }
  const seat = await Seat.findById(seatId);

  if (!seat) {
    throw new ApiError(404, "seat you want to delete not found");
  }
  const event = await Event.findById(seat.eventId);
  if (event?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "you can not authorised to delete this seat");
  }
  const deletedseat = await Seat.findByIdAndDelete({
    _id: seatId,
    Status: "AVAILABLE",
  });
  if (!deleteSeat) {
    throw new ApiError(409, "only available seat can be deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "seat delete successfully"));
});
