import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { LoginPayload, RegisterPayload, TokenPair, UserProfile } from "@/types/auth.types";

/**
 * Every auth API call lives here. Components/hooks call these functions,
 * never axios directly (per CodingStandards.md API Rules).
 */
export const authService = {
  async register(payload: RegisterPayload): Promise<TokenPair> {
    const { data } = await apiClient.post<ApiResponse<TokenPair>>("/auth/register", payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<TokenPair> {
    const { data } = await apiClient.post<ApiResponse<TokenPair>>("/auth/login", payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>("/auth/profile");
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
