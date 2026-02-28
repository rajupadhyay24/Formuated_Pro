"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  emailId: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailId: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.isPremium =
        parsedUser.isPremium === true || parsedUser.isPremium === "true";
      setUser(parsedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (emailId: string, password: string) => {
    const response = await fetch(
      "process.env.NEXT_PUBLIC_API_URL/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, password }),
      },
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("isPremium", data.isPremium);
  };

  const register = async (formData: any) => {
    const response = await fetch(
      "process.env.NEXT_PUBLIC_API_URL/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
