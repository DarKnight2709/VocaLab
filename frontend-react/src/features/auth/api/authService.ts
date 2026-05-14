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
import i18n from "@/shared/i18n";
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
      toast.success(i18n.t("auth.loginSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.loginFailed")));
    },
  });
};
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (body: SignUpBodyType) => api.post(API_ROUTES.AUTH.SIGNUP, body),
    onSuccess: () => {
      toast.success(i18n.t("auth.signUpSuccess"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("auth.signUpFailed")));
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
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success(i18n.t("auth.logoutSuccess"));
    },
    onError: (error) => {
      logout();
      queryClient.clear();
      toast.error(getErrorMessage(error, i18n.t("auth.logoutFailed")));
    },
  });
};

export const useChangePasswordMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: (body: ChangePasswordBodyType) =>
      api.patch(API_ROUTES.AUTH.CHANGE_PASSWORD, body),
    onSuccess: () => {
      logout();
      toast.success(i18n.t("auth.changePasswordSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.changePasswordFailed")));
    },
  });
};

export const useSetPasswordMutation = () => {
  const queryClient = useQueryClient(); // Dùng để làm mới cache
  return useMutation({
    mutationFn: (body: SetPasswordBodyType) =>
      api.patch(API_ROUTES.AUTH.SET_PASSWORD, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("auth.setPasswordSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.setPasswordFailed")));
    },
  });
};


export const useUpdateTwoFactorAuthMutation = () => {
  return useMutation({
    mutationFn: () => fetchWithSchema(api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_GENERATE), TwoFactorAuthResponseSchema),
    onSuccess: () => {
      toast.success(i18n.t("auth.generateTwoFactorSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.generateTwoFactorFailed")));
    }
  })
}

export const useVerifyTwoFactorAuthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_VERIFY, { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("auth.verifyTwoFactorSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.verifyTwoFactorFailed")));
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
      toast.success(i18n.t("auth.loginSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.verifyTwoFactorFailedGeneric")));
    },
  });
};

export const useDisableTwoFactorAuthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API_ROUTES.AUTH.TWO_FACTOR_AUTH_DISABLE),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("auth.disableTwoFactorSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, i18n.t("auth.disableTwoFactorFailed")));
    },
  });
};