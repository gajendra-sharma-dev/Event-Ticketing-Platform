import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) return;
  this.password = await bcryptjs.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async (password) => {
  return await bcryptjs.compare(password, this.password);
};

userSchema.methods.genraterefreshToken = async () => {
  return (
    await jwt.sign(
      {
        _id: _id,
        username: username,
        email: email,
      },
      process.env.REFRESH_TOKEN_KEY,
    ),
    { expiresIn: process.env.REFRESH_TOKEN_EXPRIY }
  );
};

userSchema.methods.genrateAccessToken = async () => {
  return (
    await jwt.sign(
      {
        _id: _id,
        username: username,
        email: email,
      },
      process.env.ACCESS_TOKEN_KEY,
    ),
    { expiresIn: process.env.ACCESS_TOKEN_EXPRIY }
  );
};
export const User = mongoose.model("User", userSchema);
