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

export { app };
