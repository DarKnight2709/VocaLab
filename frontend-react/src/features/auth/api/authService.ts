// import { useAuthStore } from '@/features/auth/stores/authStore.ts';
// import { authAPI } from '@/api/auth.api'
// import { authStorage } from '../stores/authStorage'

// export type LoginResult =
//   | { success: true; user: unknown }
//   | { success: false; message: string }

// export const authService = {
//   async login(username: string, password: string): Promise<LoginResult> {
//     try {
//       const response = await authAPI.login(username, password)
//       const token = (response.data as { token?: string })?.token
//       if (!token) return { success: false, message: 'Thiếu token từ server' }

//       authStorage.setToken(token)

//       const meResponse = await authAPI.getMe()
//       const user = (meResponse.data as { user?: unknown })?.user ?? meResponse.data
//       authStorage.setUser(user)

//       return { success: true, user }
//     } catch (error: any) {
//       authStorage.clear()
//       const message =
//         error?.response?.data?.message || error?.response?.data?.error || 'Đăng nhập thất bại'
//       return { success: false, message }
//     }
//   },

//   async signup(username: string, password: string, fullName: string, email: string) {
//     try {
//       await authAPI.signup(username, password, fullName, email)
//       return { success: true as const, message: 'Đăng ký thành công' }
//     } catch (error: any) {
//       const message =
//         error?.response?.data?.message || error?.response?.data?.error || 'Đăng ký thất bại'
//       return { success: false as const, message }
//     }
//   },

//   async logout() {
//     try {
//       await authAPI.logout()
//     } catch {
//       // ignore
//     } finally {
//       authStorage.clear()
//     }
//   },

//   isAuthenticated(): boolean {
//     return !!authStorage.getToken()
//   },

//   async checkAuth(): Promise<unknown | null> {
//     if (!this.isAuthenticated()) return null

//     try {
//       const response = await authAPI.getMe()
//       const user = (response.data as { user?: unknown })?.user ?? response.data
//       authStorage.setUser(user)
//       return user
//     } catch {
//       authStorage.clear()
//       return null
//     }
//   },
// }

import useAuthStore from "../stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LoginBodyType,
  LoginResponse,
  MeResponse,
  SignUpBodyType,
  UpdatePersonalInfoBodyType,
  UpdateProfileResponse,
} from "@/shared/validations/AuthSchema";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import type { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
};

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (body: LoginBodyType) =>
      api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, body),
    onSuccess: async (response) => {
      await login(response.data);
      toast.success("Đăng nhập thành công.");
    },
    onError: (error: AxiosError<ApiErrorBody>) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại.",
      );
    },
  });
};
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (body: SignUpBodyType) =>
      api.post(API_ROUTES.AUTH.SIGNUP, body),
    onSuccess: async () => {
      toast.success("Đăng ký thành công.");
    },
    onError: (error: AxiosError<ApiErrorBody>) => {
      toast.error(error.response?.data?.message || error.message || "Đăng ký thất bại.");
    },
  });
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get<{ user: MeResponse }>(
          API_ROUTES.AUTH.ME,
        );
        return response.data.user;
      } catch (error: any) {
        return null;
      }
    },
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: (refreshToken: string) => api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
    // mutationFn: () => api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
    mutationFn: () => api.post(API_ROUTES.AUTH.LOGOUT),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Đăng xuất thành công.");
    },
    onError: (error: any) => {
      logout();
      queryClient.clear();
      const axiosError = error as AxiosError<ApiErrorBody>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Đăng xuất thất bại.",
      );
    },
  });
};

export const useUpdatePersonalInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePersonalInfoBodyType) =>
      api.patch<UpdateProfileResponse>(API_ROUTES.AUTH.UPDATE_PROFILE, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(
        data.data.message || "Cập nhật thông tin cá nhân thành công.",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Cập nhật thông tin thất bại.",
      );
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return api.patch<{ avatarUrl: string }>(
        "/users/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Cập nhật ảnh thành công.");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Cập nhật ảnh thất bại.",
      );
    },
  });
};

// export const useChangePasswordMutation = () => {
//   return useMutation({
//     mutationFn: (body: ChangePasswordBodyType) =>
//       api.patch<UpdateProfileResponse>(API_ROUTES.AUTH.CHANGE_PASSWORD, body),
//     onSuccess: (data) => {
//       toast.success(data.data.message || 'Đổi mật khẩu thành công.')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại.')
//     }
//   })
// }
