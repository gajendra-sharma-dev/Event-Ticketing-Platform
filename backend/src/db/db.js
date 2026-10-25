import { BASEDB } from "../constent.js";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connntection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${BASEDB}`,
    );
  } catch (error) {
    console.log("mongodb conntection failed", error);
    process.exit(1);
  }
};
