import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const ticketSchema = new Schema(
  {
    evnet: {
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
    code: uuidv4(),
  },
  { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
