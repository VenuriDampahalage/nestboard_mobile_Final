// src/api/auth.ts
import { apiClient } from "./apiClient";
import { AuthResponse, LoginPayload, RegisterPayload, AuthTokens, User, UpdateProfilePayload } from "../types/auth";

export const AuthAPI = {
  login: async (payload: LoginPayload) => {
    const d = await apiClient.post<AuthResponse>("auth/login", payload);
    return d.data;
  },

  socialAuth: async (idToken: string) => {
    const d = await apiClient.post<AuthResponse>("auth/google", {
      idToken,
    });
    return d.data;
  },

  register: async (payload: RegisterPayload) => {
    const d = await apiClient.post<AuthResponse>("auth/register", payload);
    return d.data;
  },

  refresh: async (refreshToken: string) => {
    const d = await apiClient.post<AuthTokens>("auth/refresh", { refreshToken });
    return d.data;
  },

  getProfile: async () => {
    const d = await apiClient.get<User>("auth/me");
    return d.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const d = await apiClient.patch<User>("auth/me", payload);
    return d.data;
  },

  uploadAvatar: async (formData: FormData) => {
    const d = await apiClient.post<{ url: string }>("uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return d.data;
  },
};

