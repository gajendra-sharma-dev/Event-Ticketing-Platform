import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    Status: {
      type: String,
      enum: ["PANDDING", "PAID", "CANCELLED", "REFUNDED"],
      default: "PANDDING",
    },

    totelAmmout: {
      type: Number,
      required: true,
      min: 0,
    },
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    eventId: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
    },
    seats: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Seat",
      },
    ],
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
