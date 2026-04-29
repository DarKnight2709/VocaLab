import { decodeToken } from "@/shared/lib/jwt";
import { RefreshTokenResponseSchema } from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useAuthStore } from "./stores/authStore";

export const authLoader = async () => {
  const { token, logout, login } = useAuthStore.getState(); 

  try {
    const accessToken = token?.accessToken;
    const refreshToken = token?.refreshToken;

    if (!accessToken || !refreshToken) {
      logout();
      return { isAuth: false };
    }

    const decodedAccess = decodeToken(accessToken);
    if (!decodedAccess) {
      logout();
      return { isAuth: false };
    }

    const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

    if (!isAccessTokenExpired) {
      return { isAuth: true };
    }

    const decodedRefresh = decodeToken(refreshToken);
    if (!decodedRefresh || decodedRefresh.exp * 1000 < Date.now()) {
      logout();
      return { isAuth: false };
    }

    try {
      const data = await fetchWithSchema(
        api.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refreshToken }),
        RefreshTokenResponseSchema,
      );
      login(data); 
      return { isAuth: true };
    } catch {
      logout();
      return { isAuth: false };
    }
  } catch {
    logout();
    return { isAuth: false };
  }
};
