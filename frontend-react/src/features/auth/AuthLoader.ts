import { MeResponseSchema } from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useAuthStore } from "./stores/authStore";

const refreshToken = async (clearAuthState: () => void) => {
  try {
    await api.post(API_ROUTES.AUTH.REFRESH_TOKEN);
    const { data: me } = await fetchWithSchema(
      api.get(API_ROUTES.AUTH.ME),
      MeResponseSchema,
    );
    if (me?.id) {
      useAuthStore.setState({ isAuth: true, userId: me.id });
      return { isAuth: true };
    }
    return { isAuth: false };
  } catch {
    clearAuthState();
    return { isAuth: false };
  }
};

export const authLoader = async () => {
  const { isAuth, clearAuthState } = useAuthStore.getState();

  if (isAuth) {
    return { isAuth: true };
  }

  try {
    const { data: me } = await fetchWithSchema(
      api.get(API_ROUTES.AUTH.ME),
      MeResponseSchema,
    );
    if (me?.id) {
      useAuthStore.setState({ isAuth: true, userId: me.id });
      return { isAuth: true };
    }
  } catch {
    // accessToken cookie missing or expired, attempt token refresh via refreshToken cookie
  }

  return refreshToken(clearAuthState);
};
