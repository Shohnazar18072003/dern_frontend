"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import api from "@/lib/api";
import { AuthContext } from "./AuthContextObject";
import type { AuthContextType, RegisterData } from "./AuthContextObject";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, user } = response.data;

    localStorage.setItem("accessToken", accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
// useAuth hook has been moved to a separate file: useAuth.ts
