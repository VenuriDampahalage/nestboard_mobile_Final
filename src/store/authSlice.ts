import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/auth";

export interface AuthState {
  refreshToken: string;
  accessToken: string;
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: AuthState = {
  refreshToken: "",
  accessToken: "",
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    initAuth: (
      state,
      action: PayloadAction<{
        refreshToken: string;
      }>,
    ) => {
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.refreshToken = "";
      state.accessToken = "";
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { saveToken, setUser, updateUser, initAuth, logout } =
  authSlice.actions;

export default authSlice.reducer;

