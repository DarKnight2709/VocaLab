import { toast } from "sonner";
import { create } from "zustand";
import type { LoginResponse } from "@/shared/validations/AuthSchema";
import { decodeToken } from "@/shared/lib/jwt";
import { persist, createJSONStorage } from 'zustand/middleware'
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { JwtPayload } from "jwt-decode";


interface AuthState {
  isAuth: boolean;
  userId: string | null;
  token: LoginResponse | null;
  error: string | null;

  login: (token: LoginResponse) => void;
  logout: () => void;
}

// set: hàm để cập nhật state
// get: hàm lấy state hiện tại
export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    isAuth: false,
    userId: null,
    token: null,
    error: null,

    login: (token: LoginResponse) => {
      // check token exists
      if (!token || !token.accessToken) {
        toast.error("Thiếu token!", {
          description: "Vui lòng đăng nhập lại.",
        });
        set({ token: null, error: "Thiếu token!" });
        return;
      }

      let decoded: JwtPayload | null = null;
      try {
        // check token valid
        decoded = decodeToken(token.accessToken);
        if (!decoded) {
          toast.error("Token không hợp lệ!", {
            description: "Vui lòng đăng nhập lại.",
          });
          set({ token: null, error: "Token không hợp lệ!"});
          return;
        }
      } catch (error) {
        toast.error("Token không hợp lệ!", {
          description: "Vui lòng đăng nhập lại.",
        });
        set({ token: null, error: "Token không hợp lệ!" });
        return;
      }

      set({ token, error: null, isAuth: true, userId: decoded.sub });
      useSocketStore.getState().connect(token.accessToken);
    },

    logout: () => {
      set({ token: null, error: null, isAuth: false, userId: null });
      useSocketStore.getState().disconnect();
    },
  }),
  {
    name: "auth-vocalab-storage",
    storage: createJSONStorage(() => localStorage),
  })
);
