"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

import { ROUTES } from "@/constants/app.constants";
import { authService } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload, UserProfile } from "@/types/auth.types";
import { tokenStorage } from "@/utils/token.utils";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload: LoginPayload) => {
    const tokens = await authService.login(payload);
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    setUser(tokens.user);
    toast.success("Logged in successfully");
    router.push(ROUTES.DASHBOARD);
  };

  const register = async (payload: RegisterPayload) => {
    const tokens = await authService.register(payload);
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    setUser(tokens.user);
    toast.success("Account created successfully");
    router.push(ROUTES.DASHBOARD);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clear();
      setUser(null);
      toast.success("Logged out");
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
