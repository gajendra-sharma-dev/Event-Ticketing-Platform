import axios from "axios";

const base = "http://localhost:5000/api/v2/users";
const make = (path) =>
  axios.create({
    baseURL: path ? `${base}/${path}` : base,
    withCredentials: true,
  });

export const api = make(""); // /api/v2/users
export const eventApi = make("event"); // /api/v2/users/event
export const orderApi = make("order"); // /api/v2/users/order
export const seatApi = make("seats"); // /api/v2/users/seats
export const ticketApi = make("tickets"); // /api/v2/users/tickets

export const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Something went wrong";
