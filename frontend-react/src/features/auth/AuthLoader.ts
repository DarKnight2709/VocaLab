import { decodeToken } from "@/shared/lib/jwt";
import {
  RefreshTokenResponseSchema,
  type LoginResponse,
  type TempTokenResponse,
} from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useAuthStore } from "./stores/authStore";

const refreshToken = async (
  login: (token: LoginResponse | TempTokenResponse) => void,
  clearAuthState: () => void,
) => {
  try {
    const { data: token } = await fetchWithSchema(
      api.post(API_ROUTES.AUTH.REFRESH_TOKEN),
      RefreshTokenResponseSchema,
    );
    login(token);
    return { isAuth: true };
  } catch {
    clearAuthState();
    return { isAuth: false };
  }
};

export const authLoader = async () => {
  const { authToken, login, clearAuthState } = useAuthStore.getState();

  const accessToken = authToken?.accessToken;

  if (!accessToken) {
    return refreshToken(login, clearAuthState);
  }
  const decodedAccess = decodeToken(accessToken);
  if (!decodedAccess) {
    return refreshToken(login, clearAuthState);
  }

  const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

  if (!isAccessTokenExpired) {
    return { isAuth: true };
  }

  return refreshToken(login, clearAuthState);
};
