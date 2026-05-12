import { decodeToken } from "@/shared/lib/jwt";
import { RefreshTokenResponseSchema } from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useAuthStore } from "./stores/authStore";

export const authLoader = async () => {
  const {
    authToken,
    login,
    clearAuthState
  } = useAuthStore.getState();

  try {
    const accessToken = authToken?.accessToken;
    const refreshToken = authToken?.refreshToken;

    if (!accessToken && !refreshToken) {
      clearAuthState();
      return { isAuth: false };
    }

    if (accessToken && refreshToken) {
      const decodedAccess = decodeToken(accessToken);
      if (!decodedAccess) {
        clearAuthState();
        return { isAuth: false };
      }

      const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

      if (!isAccessTokenExpired) {
        return { isAuth: true };
      }

      const decodedRefresh = decodeToken(refreshToken);
      if (!decodedRefresh || decodedRefresh.exp * 1000 < Date.now()) {
        clearAuthState();
        return { isAuth: false };
      }

      try {
        const { data: token } = await fetchWithSchema(
          api.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refreshToken }),
          RefreshTokenResponseSchema,
        );
        login(token);
        return { isAuth: true };
      } catch {
        clearAuthState();
        return { isAuth: false };
      }
    }
    return { isAuth: false };
  } catch {
    clearAuthState();
    return { isAuth: false };
  }
};
