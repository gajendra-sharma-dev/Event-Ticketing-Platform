import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    Status: {
      type: String,
      enum: ["PANDDING", "PAID", "REFUNDED"],
      default: "PANDDDING",
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
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
