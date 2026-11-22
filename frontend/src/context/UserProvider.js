"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { api } from "@/db/api";
import { useContext } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUser = useCallback(async () => {
    try {
      const res = await api.get("/getUser");
      setUser(res.data.data);
      setError("");
    } catch (error) {
      setUser(null);

      if (error?.response?.status !== 401)
        setError(
          error.response?.data?.errors ||
            error.response?.data?.message ||
            "something went wrong",
        );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const register = async ({ username, email, password }) => {
    const res = await api.post("/register", { username, email, password });
    setUser(res.data);
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/login", { email, password });
    setUser(res.data.data);
    return res.data;
  };
  const logout = async () => {
    try {
      const res = await api.post("/logout");
      return res;
    } catch (error) {
      setError(
        error.response?.data?.errors ||
          error.response?.data?.message ||
          "logout failed",
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        register,
        login,
        logout,
        getUser,
        loading,
        user,
        setUser,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
