import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";
import { Event } from "../model/event.model.js";
import { uploadImage } from "../utils/cloudinary.js";

const createEvent = asynchandler(async (req, res) => {
  const { name, city, descrpition, Status } = req.body;

  if (
    [name, city, descrpition, Status].some(
      (filed) => !filed || filed.trim() === "",
    )
  ) {
    throw new ApiError(400, "all filed is required");
  }

  const exitingUser = await User.findById(req.user?._id);

  if (!exitingUser) {
    throw new ApiError(400, "user not found");
  }

  // image is optional: upload to Cloudinary only if a file was sent
  let image = "";
  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer);
    image = uploaded.secure_url;
  }

  const createEvent = await Event.create({
    name,
    descrpition,
    city,
    Status,
    image,
    user: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, createEvent, "Event create successfully"));
});

// getAllEvent and GetEventById already return the whole event document,
// so the `image` link comes back automatically. No change needed there.
const getAllEvent = asynchandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const event = await Event.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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
  const { eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(400, "event not create yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "event get successfully"));
});

const updateEvent = asynchandler(async (req, res) => {
  const { name, city, descrpition, Status } = req.body;
  const { eventId } = req.params;

  if (
    [name, city, descrpition, Status].some(
      (filed) => !filed || filed.trim() === "",
    )
  ) {
    throw new ApiError(400, "all filed is required");
  }

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(400, "event you want to update is not found");
  }

  if (event?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you can not authorised to update this event");
  }

  // only touch `image` when a new file was sent, otherwise keep the old one
  const set = { name, city, descrpition, Status };
  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer);
    set.image = uploaded.secure_url;
  }

  const updatedevent = await Event.findByIdAndUpdate(
    eventId,
    { $set: set },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedevent, "event update successfully"));
});

const DeleteEvent = asynchandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, "event id is not correct from");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(400, "event you want to delete is not found");
  }

  if (event?.user?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you can not authorised to delete this event");
  }
  await Event.findByIdAndDelete(eventId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "event delete successfully"));
});

export { createEvent, getAllEvent, GetEventById, updateEvent, DeleteEvent };
