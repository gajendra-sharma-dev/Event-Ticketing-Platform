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
    evnet: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
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
  },
  { timestamps: true },
);

export const Seat = mongoose.model("Seat", seatSchema);
