import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());

dotenv.config({
  path: "./.env",
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

import registerRouter from "./router/user.router.js";
import loginRouter from "./router/user.router.js";
import getUserRouter from "./router/user.router.js";
import refreshTokenRouter from "./router/user.router.js";
import updateUserDetailRouter from "./router/user.router.js";
import updateUserPassword from "./router/user.router.js";
import logoutRouter from "./router/user.router.js";

import createEventRouter from "./router/event.router.js";
import getAllEventRouter from "./router/event.router.js";
import getByIdEventRouter from "./router/event.router.js";
import updateEventRouter from "./router/event.router.js";
import deleteEventRouter from "./router/event.router.js";

import createOrderRouter from "./router/order.router.js";
import payOrderRouter from "./router/order.router.js";
import refundedOrderRouter from "./router/order.router.js";
import getOrderByIdRouter from "./router/order.router.js";
import getMyOrderRouter from "./router/order.router.js";
import cancelOrderRouter from "./router/order.router.js";

import createSeatRouter from "./router/seat.router.js";
import getSeatByIdRouter from "./router/seat.router.js";
import getSeatByEventRouter from "./router/seat.router.js";
import updatedSeatRouter from "./router/seat.router.js";
import deleteSeatRouter from "./router/seat.router.js";

import createTicketRouter from "./router/ticket.router.js";
import getTicketByEventIdRouter from "./router/ticket.router.js";
import getTicketOrderIdRouter from "./router/ticket.router.js";
import getTicketByIdRouter from "./router/ticket.router.js";
import deleteTicketRouter from "./router/ticket.router.js";
import checkedTicketRouter from "./router/ticket.router.js";

app.use("/api/v2/users", registerRouter);
app.use("/api/v2/users", loginRouter);
app.use("/api/v2/users", getUserRouter);
app.use("/api/v2/users", refreshTokenRouter);
app.use("/api/v2/users", updateUserDetailRouter);
app.use("/api/v2/users", updateUserPassword);
app.use("/api/v2/users", logoutRouter);

app.use("/api/v2/users/event", createEventRouter);
app.use("/api/v2/users/event", getAllEventRouter);
app.use("/api/v2/users/event", getByIdEventRouter);
app.use("/api/v2/users/event", updateEventRouter);
app.use("/api/v2/users/event", deleteEventRouter);

app.use("/api/v2/users/order", createOrderRouter);
app.use("/api/v2/users/order", payOrderRouter);
app.use("/api/v2/users/order", refundedOrderRouter);
app.use("/api/v2/users/order", getOrderByIdRouter);
app.use("/api/v2/users/order", getMyOrderRouter);
app.use("/api/v2/users/order", cancelOrderRouter);

app.use("/api/v2/users/seats", createSeatRouter);
app.use("/api/v2/users/seats", getSeatByEventRouter);
app.use("/api/v2/users/seats", getSeatByIdRouter);
app.use("/api/v2/users/seats", updatedSeatRouter);
app.use("/api/v2/users/seats", deleteSeatRouter);

app.use("/api/v2/users/tickets", createTicketRouter);
app.use("/api/v2/users/tickets", getTicketByEventIdRouter);
app.use("/api/v2/users/tickets", getTicketByIdRouter);
app.use("/api/v2/users/tickets", getTicketOrderIdRouter);
app.use("/api/v2/users/tickets", deleteTicketRouter);
app.use("/api/v2/users/tickets", checkedTicketRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export { app };
