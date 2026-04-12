import { decodeToken } from "@/shared/lib/jwt";
import { store } from "@/shared/stores/redux/store";
import { logoutSync, setLoading } from "@/shared/stores/redux/slices/authSlice";
import { loginAction } from "@/shared/stores/redux/authActions";
import { RefreshTokenResponseSchema } from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import type { AppDispatch } from "@/shared/stores/redux/store";

export const authLoader = async () => {
  const dispatch = store.dispatch as AppDispatch;
  const { token, isLoading } = store.getState().auth;

  // Khi F5, redux state bị mất nhưng token thường được persisted trong localStorage (nếu bạn dùng redux-persist)
  // Ở đây chúng ta kiểm tra token thay vì isAuth vì isAuth sẽ luôn là false khi vừa load lại trang
  if (!token?.accessToken) {
    dispatch(setLoading(false));
    dispatch(logoutSync());
    return { auth: false };
  }

  try {
    const accessToken = token?.accessToken;
    const refreshToken = token?.refreshToken;

    if (!accessToken) {
      dispatch(setLoading(false));
      dispatch(logoutSync());
      return { auth: false };
    }

    const decodedAccess = decodeToken(accessToken);
    if (!decodedAccess) {
      dispatch(setLoading(false));
      dispatch(logoutSync());
      return { auth: false };
    }

    const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

    if (!isAccessTokenExpired) {
      dispatch(setLoading(false));
      return { auth: true };
    }

    if (!refreshToken) {
      dispatch(setLoading(false));
      dispatch(logoutSync());
      return { auth: false };
    }

    const decodedRefresh = decodeToken(refreshToken);
    if (!decodedRefresh || decodedRefresh.exp * 1000 < Date.now()) {
      dispatch(setLoading(false));
      dispatch(logoutSync());
      return { auth: false };
    }

    try {
      if (isLoading) return { auth: false };
      dispatch(setLoading(true));
      const data = await fetchWithSchema(
        api.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refreshToken }),
        RefreshTokenResponseSchema,
      );
      dispatch(loginAction(data));
      dispatch(setLoading(false));
      return { auth: true };
    } catch {
      dispatch(setLoading(false));
      dispatch(logoutSync());
      return { auth: false };
    }
  } catch {
    dispatch(setLoading(false));
    dispatch(logoutSync());
    return { auth: false };
  }
};
