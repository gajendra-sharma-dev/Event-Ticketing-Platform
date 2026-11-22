import axios from "axios";

const base =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v2/users";

const make = (path) => {
  const instance = axios.create({
    baseURL: path ? `${base}/${path}` : base,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response) {
        error.userMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        error.userMessage = "Cannot reach the server. Is the backend running?";
      } else {
        error.userMessage = error.message;
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const api = make(""); // /api/v2/users
export const eventApi = make("event"); // /api/v2/users/event
export const orderApi = make("order"); // /api/v2/users/order
export const seatApi = make("seats"); // /api/v2/users/seats
export const ticketApi = make("tickets"); // /api/v2/users/tickets

export const errMsg = (e) =>
  e?.userMessage ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong";
