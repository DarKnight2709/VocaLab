import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse } from "@/shared/validations/AuthSchema";

interface AuthState {
  isAuth: boolean;
  userId: string | null;
  token: LoginResponse | null;
  isLoading: boolean;
  username: string | null;
}

const initialState: AuthState = {
  isAuth: false,
  userId: null,
  token: null,
  isLoading: false,
  username: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        token: LoginResponse;
        userId: string;
        username: string;
      }>,
    ) {
      state.isAuth = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
    logoutSync(state) {
      state.isAuth = false;
      state.token = null;
      state.userId = null;
      state.username = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { loginSuccess, logoutSync, setLoading } = authSlice.actions;
export default authSlice.reducer;
