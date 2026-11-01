import asynchandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";
import { Order } from "../model/order.model.js";

const createOrder = asynchandler(async (req, res) => {
  const { totelAmmount } = req.body;
  const { userId } = req.params;

  if (!totelAmmount || totelAmmount !== "Number" || totelAmmount > 0) {
    throw new ApiError(400, "totel ammount is a number and greater then zero");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "user id is not correct from");
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "user not found");
  }
  const order = await Order.create({
    totelAmmout,
    customer: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, order, "order successfully created"));
});

const getMyAllOrder = asynchandler(async (req, res) => {});

const getOrderById = asynchandler(async (req, res) => {});

const payOrder = asynchandler(async (req, res) => {});

export { createOrder, getMyAllOrder, getOrderById, payOrder };
