import { toast } from "sonner";
import { create } from "zustand";
import type {
  LoginResponse,
  TempTokenResponse,
} from "@/shared/validations/AuthSchema";
import { decodeToken } from "@/shared/lib/jwt";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { JwtPayload } from "jwt-decode";

interface AuthState {
  isAuth: boolean;
  isFirstFactorPassed: boolean;
  userId: string | null;
  authToken: LoginResponse | null;
  tempToken: TempTokenResponse | null;
  error: string | null;

  login: (token: LoginResponse | TempTokenResponse) => void;
  logout: () => void;
  clearAuthState: () => void;
}

// set: hàm để cập nhật state
// get: hàm lấy state hiện tại
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuth: false,
      isFirstFactorPassed: false,
      userId: null,
      authToken: null,
      tempToken: null,
      error: null,

      login: (token: LoginResponse | TempTokenResponse) => {
        // 1. Xác định token thuộc loại nào
        const rawToken =
          "tempToken" in token ? token.tempToken : token.accessToken;

        if (!rawToken) {
          toast.error("Thiếu token!", {
            description: "Vui lòng đăng nhập lại.",
          });
          get().clearAuthState();
          return;
        }

        // 2. Decode và validate
        let decoded: JwtPayload | null = null;
        try {
          decoded = decodeToken(rawToken);
          if (!decoded) throw new Error("Invalid token");
        } catch (error) {
          toast.error("Token không hợp lệ!", {
            description: "Vui lòng đăng nhập lại.",
          });
          get().clearAuthState();
          return;
        }

        // 3. Phân nhánh xử lý State
        if ("tempToken" in token) {
          set({
            isAuth: false,
            isFirstFactorPassed: true,
            authToken: null,
            tempToken: token,
            error: null,
            userId: decoded.sub,
          });
        } else {
          set({
            isAuth: true,
            isFirstFactorPassed: false,
            authToken: token,
            tempToken: null,
            error: null,
            userId: decoded.sub,
          });
          useSocketStore.getState().connect(token.accessToken);
        }
      },

      logout: () => {
        get().clearAuthState();
        useSocketStore.getState().disconnect();
      },

      clearAuthState: () => {
        set({
          isAuth: false,
          authToken: null,
          tempToken: null,
          error: null,
          userId: null,
        });
      },
    }),

    {
      name: "auth-vocalab-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
