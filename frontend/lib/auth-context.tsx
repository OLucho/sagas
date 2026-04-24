"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "./types";
import { signIn } from "./api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem("sagas_token");
    const storedUser = localStorage.getItem("sagas_user");
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("sagas_token");
        localStorage.removeItem("sagas_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await signIn(email, password);
      
      setUser({
        id: response.userId,
        email,
        name: response.username,
      });
      setToken(response.token);
      localStorage.setItem("sagas_token", response.token);
      localStorage.setItem("sagas_user", JSON.stringify({
        id: response.userId,
        email,
        name: response.username,
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    setUser(user);
    localStorage.setItem("sagas_user", JSON.stringify(user));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sagas_token");
    localStorage.removeItem("sagas_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        token,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
