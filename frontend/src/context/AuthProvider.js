"use client";
import { api } from "@/db/api";
import { createContext, useEffect, useState } from "react";

import React from "react";

export const UserContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  const [loading, setloading] = useState(true);
  const [error, setError] = useState(true);

  useEffect(() => {
    const userFetch = async () => {
      try {
        const res = await api.get("/getUser");
        setUser(res.data.data);
      } catch (error) {
        if (error?.response?.status === 401) {
          setUser(null); // just not logged in
        }
        setError(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "user not fetch",
        );
      } finally {
        setloading(false);
      }
    };
    userFetch();
  }, []);

  const register = async ({ username, email, password }) => {
    const res = await api.post("/register", { username, email, password });
    console.log(res);
    console.log(res.data);
    console.log(res.data.data);

    setUser(res.data.data);
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
        error.response.data.errors ||
          error.response.data.message ||
          "logout failed",
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setError,
        setUser,
        loading,
        setloading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default AuthProvider;
