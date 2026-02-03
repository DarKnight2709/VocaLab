
// Đây là Auth State Store được tạo bằng Zustand
// Lưu token + user info
// Decode token để lấy roles, username, userid
// Quản lý trạng thái login/ logout
// Lưu state vào localStorage để giữ đăng nhập sau F5
// Kết nối / ngắt kết nối socket khi login/logout.

import { decodeToken } from "@/shared/lib/jwt";
import { useSocketStore } from "@/shared/stores/useSocketStore";
// import { useSmartHomeSocketStore } from '@/features/smart-home/stores/useSmartHomeSocketStore' // Tạm thời tắt Socket.IO
import type { LoginResponse } from "@/shared/validations/AuthSchema";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// Định nghĩa shape của Auth State
interface AuthState {
  isAuth: boolean;
  userId: string | null; // id trong jwt (decoded)
  token: LoginResponse | null; // token được server trả (accessToken, refreshToken)
  isLoading: boolean; // loading cho UI
  username: string | null; // username trong jwt (decoded)
  login: (token: LoginResponse) => Promise<void>; // hàm login
  logout: () => void; // hàm logout
  setLoading: (loading: boolean) => void; // hàm set loading
}

// tạo store Zustand
const useAuthStore = create<AuthState>()(
  devtools(
    // lưu state vào localStorage
    persist<AuthState>(
      (set) => ({
        isAuth: false,
        userId: null,
        token: null,
        isLoading: false,
        username: null,
        // logic quan trọng nhất
        // decode access token để lấy thông tin user
        login: async (token: LoginResponse) => {
          const decodedToken = decodeToken(token.accessToken);
          // decode lỗi -> token rác -> logout
          if (!decodedToken) {
            const { disconnect } = useSocketStore.getState();
            disconnect();
            set({ isAuth: false, token: null, userId: null, username: null });
            return;
          }
          // lưu thông tin vào store
          // và nhờ persist tất cả được lưu vào localStorage
          set({
            isAuth: true,
            token: token,
            userId: decodedToken.sub,
            username: decodedToken.username,
          });

          // Kết nối socket ngay sau khi login
          // truyền accessToken vào socket để xác thực
          const { connect } = useSocketStore.getState();
          // const { connect: connectSmartHome } = useSmartHomeSocketStore.getState() // Tạm thời tắt
          connect(token.accessToken);
          // connectSmartHome(token.accessToken) // Tạm thời tắt Socket.IO
        },
        logout: () => {
          // ngắt kết nối socket
          const { disconnect } = useSocketStore.getState();
          // const { disconnect: disconnectSmartHome } = useSmartHomeSocketStore.getState() // Tạm thời tắt
          disconnect();
          // disconnectSmartHome() // Tạm thời tắt Socket.IO

          // xóa toàn bộ thông tin dữ liệu đăng nhập
          // và nhờ persist tất cả được xóa khỏi localStorage
          set({ isAuth: false, token: null, userId: null, username: null });
        },
        // dùng để hiển thị loading cho UI
        // VD: nút login, form,...
        setLoading: (loading: boolean) => set({ isLoading: loading }),
      }),
      // lưu vào localStorage với key 'auth-storage'
      // F5 vẫn đăng nhập
      {
        name: "auth-chatapp-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

export default useAuthStore;
