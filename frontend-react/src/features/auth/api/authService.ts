import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LoginBodyType,
  SignUpBodyType,
  ChangePasswordBodyType,
  SetPasswordBodyType,
  TwoFactorLoginBodyType,
} from "@/shared/validations/AuthSchema";

import {
  MeResponseSchema,
  LoginResponseSchema,
  TwoFactorAuthResponseSchema,
  TempTokenResponseSchema,
} from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";
import z from "zod";

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (body: LoginBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGIN, body),
        z.union([LoginResponseSchema , TempTokenResponseSchema]),
      ),
    onSuccess: (response) => {
      login(response.data);
      toast.success(response.message || "Đăng nhập thành công.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại."));
    },
  });
};
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (body: SignUpBodyType) => api.post(API_ROUTES.AUTH.SIGNUP, body),
    onSuccess: (response: any) => {
      toast.success(response.data.message || "Đăng ký thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng ký thất bại."));
    },
  });
};

export const useMeQuery = () => {
  const token = useAuthStore((state) => state.authToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.AUTH.ME),
        MeResponseSchema,
      );
      return result.data;
    },

    retry: false,
    enabled: !!token,
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken: string) => api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
    onSuccess: (response: any) => {
      logout();
      queryClient.clear();
      toast.success(response.data.message || "Đăng xuất thành công.");
    },
    onError: (error) => {
      logout();
      queryClient.clear();
      toast.error(getErrorMessage(error, "Đăng xuất thất bại."));
    },
  });
};

export const useChangePasswordMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: (body: ChangePasswordBodyType) =>
      api.patch(API_ROUTES.AUTH.CHANGE_PASSWORD, body),
    onSuccess: (response: any) => {
      logout();
      toast.success(response.data.message || "Đổi mật khẩu thành công.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Đổi mật khẩu thất bại."));
    },
  });
};

export const useSetPasswordMutation = () => {
  const queryClient = useQueryClient(); // Dùng để làm mới cache
  return useMutation({
    mutationFn: (body: SetPasswordBodyType) =>
      api.patch(API_ROUTES.AUTH.SET_PASSWORD, body),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(response.data.message || "Thiết lập mật khẩu thành công.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Thiết lập mật khẩu thất bại."));
    },
  });
};


export const useUpdateTwoFactorAuthMutation = () => {
  return useMutation({
    mutationFn: () => fetchWithSchema(api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_GENERATE), TwoFactorAuthResponseSchema),
    onSuccess: (response: any) => {
      toast.success(response.message || "Tạo mã 2FA thành công!");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Tạo mã 2FA thất bại!"));
    }
  })
}

export const useVerifyTwoFactorAuthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_VERIFY, { code }),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(response.data.message || "Bật xác thực 2 yếu tố thành công!");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Bật xác thực 2 yếu tố thất bại!"));
    },
  });
};

export const useLoginTwoFaMutation = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (body: TwoFactorLoginBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_LOGIN, body),
        LoginResponseSchema,
      ),
    onSuccess: (response) => {
      login(response.data);
      toast.success(response.message || "Đăng nhập thành công.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Xác thực 2FA thất bại."));
    },
  });
};

export const useDisableTwoFactorAuthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_DISABLE),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(response.data.message || "Tắt xác thực 2 yếu tố thành công.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Tắt xác thực 2 yếu tố thất bại."));
    },
  });
};