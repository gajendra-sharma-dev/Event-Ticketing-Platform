import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";
import { Event } from "../model/event.model.js";

const createEvent = asynchandler(async (req, res) => {
  const { name, city, user, descrpition, Status } = req.body;

  if ([name, city, descrpition, Status].some((filed) => filed.trim() === "")) {
    throw new ApiError(400, "all filed is required");
  }
  if (!mongoose.isValidObjectId(user)) {
    throw new ApiError(400, "user id is not correct from");
  }
  const exitingUser = await User.findOne({ user: req.user?._id });

  if (!exitingUser) {
    throw new ApiError(400, "user not found");
  }

  const createEvent = await Event.create({
    name,
    descrpition,
    city,
    Status,
    user: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, createEvent, "Event create successfully"));
});

const getAllEvent = asynchandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const event = await Event.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10)
      .limit(limit);

    const totel = await Event.countDocuments();

    return res.status(200).json(
      new ApiResponse(200, {
        page,
        totel,
        pages: Math.ceil(totel / limit),
        event,
      }),
    );
  } catch (error) {
    throw new ApiError(500, error?.message || "something went wrong");
  }
});

const GetEventById = asynchandler(async (req, res) => {
  const { EventId } = req.params;

  if (!mongoose.isValidObjectId(EventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findOne(EventId);

  if (!event) {
    throw new ApiError(400, "event not create yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "event get successfully"));
});

const updateEvent = asynchandler(async (req, res) => {
  const { name, city, descrpition, Status } = req.body;
  const { EventId } = req.params;

  if ([name, city, descrpition, Status].some((filed) => filed.trim() === "")) {
    throw new ApiError(400, "all filed is required");
  }

  if (!mongoose.isValidObjectId(EventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findById(EventId);

  if (!event) {
    throw new ApiError(400, "event you want to update is not found");
  }

  if (event?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you can not authorised to update this event");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        city,
        descrpition,
        Status,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateEvent, "event update successfully"));
});

const DeleteEvent = asynchandler(async (req, res) => {
  const { EventId } = req.params;

  if (!mongoose.isValidObjectId(EventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findById(EventId);

  if (!event) {
    throw new ApiError(400, "event you want to delete is not found");
  }

  if (event?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you can not authorised to delete this event");
  }
  await Event.findByIdAndDelete(EventId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "event update successfully"));
});

export { createEvent, getAllEvent, GetEventById, updateEvent, DeleteEvent };
