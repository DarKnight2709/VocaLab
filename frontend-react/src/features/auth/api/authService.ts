import { useAppDispatch, useAppSelector } from "@/shared/stores/redux/hooks";
import { loginAction, logoutAction } from "@/shared/stores/redux/authActions";
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
  LogoutResponseSchema,
} from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (body: LoginBodyType) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGIN, body),
        LoginResponseSchema,
      ),
    onSuccess: (response) => {
      dispatch(loginAction(response));
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
  const token = useAppSelector((state) => state.auth.token);
  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      fetchWithSchema(api.get(API_ROUTES.AUTH.ME), MeResponseSchema),
    retry: false,
    enabled: !!token,
  });
};

export const useLogoutMutation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken: string) =>
      fetchWithSchema(
        api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken }),
        LogoutResponseSchema,
      ),
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
      toast.success("Đăng xuất thành công.");
    },
    onError: (error) => {
      dispatch(logoutAction());
      queryClient.clear();
      toast.error(getErrorMessage(error, "Đăng xuất thất bại."));
    },
  });
};

export const useUpdatePersonalInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      file,
    }: {
      body: UpdatePersonalInfoBodyType;
      file?: File;
    }) => {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      if (file) {
        formData.append("avatar", file);
      }
      return fetchWithSchema(
        api.patch(API_ROUTES.USER.PROFILE, formData),
        UpdateProfileResponseSchema,
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(data.message || "Cập nhật thông tin cá nhân thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại."));
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
