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

export { app };
