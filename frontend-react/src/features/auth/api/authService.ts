

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
        const response = await api.get<MeResponse>(
          API_ROUTES.AUTH.ME,
        );
        return response.data;
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
    mutationFn: (refreshToken: string) => api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
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
      api.patch<UpdateProfileResponse>(API_ROUTES.USER.PROFILE, body),
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
        API_ROUTES.USER.UPLOAD_AVATAR,
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
