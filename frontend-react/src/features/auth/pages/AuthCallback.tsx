import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "@/shared/hooks/useTranslation";

const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");

    if (accessToken && refreshToken) {
      // Gọi hàm login của Zustand - Store sẽ tự động lưu vào localStorage
      login({
        accessToken,
        refreshToken,
      });

      // Xóa cookie sau khi đã đưa vào Zustand
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Chuyển hướng về trang chủ
      navigate("/", { replace: true });
    } else {
      // Quan trọng: Kiểm tra xem thực sự là chưa đăng nhập hay chỉ là bị chạy lại do Strict Mode
      const isAuth = useAuthStore.getState().isAuth;

      if (!isAuth) {
        navigate("/login", { replace: true });
      }
    }
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
