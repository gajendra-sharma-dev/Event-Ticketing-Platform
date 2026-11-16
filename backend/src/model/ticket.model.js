import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const ticketSchema = new Schema(
  {
    eventId: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
    },
    seatId: {
      type: mongoose.Types.ObjectId,
      ref: "Seat",
    },
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
    },
    code: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
