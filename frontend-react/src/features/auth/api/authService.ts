import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LoginBodyType,
  SignUpBodyType,
  ChangePasswordBodyType,
} from "@/shared/validations/AuthSchema";

import {
  MeResponseSchema,
  LoginResponseSchema,
  SignUpResponseSchema,
  LogoutResponseSchema,
} from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import { useAuthStore } from "../stores/authStore";

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  return useMutation({
    mutationFn: (body: LoginBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGIN, body),
        LoginResponseSchema,
      ),
    onSuccess: (response) => {
      login(response);
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


export const useChangePasswordMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: (body: ChangePasswordBodyType) =>
      api.patch(API_ROUTES.AUTH.CHANGE_PASSWORD, body),
    onSuccess: (data: any) => {
      logout();
      toast.success(data?.data?.message || 'Đổi mật khẩu thành công.');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Đổi mật khẩu thất bại.'));
    }
  });
};
