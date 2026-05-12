import ROUTES from "@/shared/lib/routes";
import { Navigate, Outlet, useLoaderData } from "react-router";
import { twoFactorAuthLoader } from "../TwoFactorAuthLoader";

const TwoFactorAuthGuard = () => {
  const { isAuth, isFirstFactorPassed } = useLoaderData<typeof twoFactorAuthLoader>();

  // 1. Nếu đã đăng nhập thành công (isAuth), chuyển thẳng về Home
  if (isAuth) {
    return <Navigate to={ROUTES.HOME.url} replace />;
  } 

  // 2. Nếu không đủ điều kiện 2FA (không có tempToken hoặc hết hạn), chuyển về Login
  if (!isFirstFactorPassed) {
    return <Navigate to={ROUTES.LOGIN.url} replace />;
  }

  // 3. Nếu OK (đang có tempToken hợp lệ), render trang 2FA
  return <Outlet />;
};

export default TwoFactorAuthGuard;
