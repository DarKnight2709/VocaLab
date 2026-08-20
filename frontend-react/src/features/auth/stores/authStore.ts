import { create } from "zustand";
import type { TempTokenResponse } from "@/shared/validations/AuthSchema";
import { decodeToken } from "@/shared/lib/jwt";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { useFcmStore } from "@/features/notification/hooks/usePushNotifications";

interface AuthState {
  isAuth: boolean;
  isFirstFactorPassed: boolean;
  userId: string | null;
  tempToken: TempTokenResponse | null;
  error: string | null;
  login: (token?: TempTokenResponse | void) => void;
  logout: () => void;
  clearAuthState: () => void;
}

// set: hàm để cập nhật state
// get: hàm lấy state hiện tại
export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuth: false,
  isFirstFactorPassed: false,
  userId: null,
  tempToken: null,
  error: null,

  login: (token?: TempTokenResponse | void) => {
    // 1. Two-Factor Auth (2FA) Temporary Token Case
    if (token && typeof token === "object" && "tempToken" in token && token.tempToken) {
      const decoded = decodeToken(token.tempToken);
      set({
        isAuth: false,
        isFirstFactorPassed: true,
        tempToken: token,
        error: null,
        userId: decoded?.sub ?? null,
      });
      return;
    }

    // 2. Standard or Cookie Login Case
    set({
      isAuth: true,
      isFirstFactorPassed: false,
      tempToken: null,
      error: null,
    });
    useSocketStore.getState().connect();
  },

  logout: () => {
    useFcmStore.getState().revokeToken().catch(console.error);
    get().clearAuthState();
    useSocketStore.getState().disconnect();
  },

  clearAuthState: () => {
    set({
      isAuth: false,
      tempToken: null,
      error: null,
      userId: null,
    });
  },
}));
