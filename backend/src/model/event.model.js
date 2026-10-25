import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    city: {
      type: String,
      required: [true, "city is required"],
    },
    descrpition: {
      type: String,
      required: [true, "descrption is required"],
    },
    Status: {
      type: String,
      enum: ["PENDDING", "CANCELLED"],
      default: "PENDDING",
    },
  },
  { timestamps: true },
);

export const Event = mongoose.model("Event", eventSchema);
