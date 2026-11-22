import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v2/users",
  withCredentials: true,
});

api.interceptors.response.use(
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
