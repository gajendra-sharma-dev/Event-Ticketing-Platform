import { api } from "@/db/api";
import { createContext, useEffect, useState } from "react";

import React from "react";

const UserContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  const [loading, setloading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const userFetch = async () => {
        const res = await api.post("/getUser");
      };
    } catch (error) {
      setError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "user not fetch",
      );
    } finally {
      setloading(true);
    }
  }, []);

  const register = async ({ username, email, password }) => {
    const res = await api.post({ username, email, password });
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/login", { email, password });
  };

  const logout = async () => {
    const res = await api.post("/logout");
  };

  return <UserContext.Provider>{children}</UserContext.Provider>;
}

export default AuthProvider;
