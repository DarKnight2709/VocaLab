import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { RefreshTokenResponseSchema } from "@/shared/validations/AuthSchema";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const hasFetched = useRef(false);

  useEffect(() => {
    const { login, clearAuthState } = useAuthStore.getState();

    if (hasFetched.current) return;
    hasFetched.current = true;

    const refreshToken = async () => {
      try {
        const { data: token } = await fetchWithSchema(
          api.post(API_ROUTES.AUTH.REFRESH_TOKEN),
          RefreshTokenResponseSchema,
        );
        login(token);
        navigate("/", { replace: true });
      } catch {
        clearAuthState();
        navigate("/login", { replace: true });
      }
    };
    refreshToken();
  }, [navigate, login]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium">{t("auth.finishingSignIn")}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
