// src/types/auth.ts
export interface User {
  id?: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
  bioTag?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
}

