import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import { Seat } from "../model/seat.model.js";
import mongoose from "mongoose";
import { Event } from "../model/event.model.js";

const createSeat = asynchandler(async (req, res) => {
  const { section, rows, number, price,seatPerrow} = req.body;
  const { EventId } = req.params;

  if (!mongoose.isValidObjectId(EventId)) {
    throw new ApiError(400, "event is not correct from");
  }

  const event = await Event.findById(EventId);
  if (!event) {
    throw new ApiError(400, "event not found");
  }
  if(!section || )
});
