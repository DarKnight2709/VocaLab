import useAuthStore from "../stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LoginBodyType,
  SignUpBodyType,
  UpdatePersonalInfoBodyType,
} from "@/shared/validations/AuthSchema";

import {
  MeResponseSchema,
  LoginResponseSchema,
  SignUpResponseSchema,
  UpdateProfileResponseSchema,
  UploadAvatarResponseSchema,
  LogoutResponseSchema,
} from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (body: LoginBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGIN, body),
        LoginResponseSchema,
      ),
    onSuccess: async (response) => {
      await login(response);
      toast.success("Đăng nhập thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại."));
    },
  });
};
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (body: SignUpBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.SIGNUP, body),
        SignUpResponseSchema,
      ),
    onSuccess: async () => {
      toast.success("Đăng ký thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng ký thất bại."));
    },
  });
};

export const useMeQuery = () => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      fetchWithSchema(api.get(API_ROUTES.AUTH.ME), MeResponseSchema),
    retry: false,
    enabled: !!token,
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken: string) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
        LogoutResponseSchema,
      ),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Đăng xuất thành công.");
    },
    onError: (error) => {
      logout();
      queryClient.clear();
      toast.error(getErrorMessage(error, "Đăng xuất thất bại."));
    },
  });
};

export const useUpdatePersonalInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePersonalInfoBodyType) =>
      fetchWithSchema(
        api.patch(API_ROUTES.USER.PROFILE, body),
        UpdateProfileResponseSchema,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(data.message || "Cập nhật thông tin cá nhân thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại."));
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return fetchWithSchema(
        api.patch(API_ROUTES.USER.UPLOAD_AVATAR, formData),
        UploadAvatarResponseSchema,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Cập nhật ảnh thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật ảnh thất bại."));
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
