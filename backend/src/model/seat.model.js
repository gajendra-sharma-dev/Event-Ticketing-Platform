import mongoose, { Schema } from "mongoose";

const seatSchema = new Schema(
  {
    Status: {
      type: String,
      enum: ["AVAILABLE", "HELD", "SOLD"],
      default: "AVAILABLE",
    },

    price: {
      type: Number,
      required: true,
    },

    number: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    rows: {
      type: String,
      required: true,
    },
    eventId: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true },
);

export const Seat = mongoose.model("Seat", seatSchema);
