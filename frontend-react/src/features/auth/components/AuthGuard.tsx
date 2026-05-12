import ROUTES from "@/shared/lib/routes";
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router";
import { authLoader } from "../AuthLoader";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

// Route Protector
const AuthGuard = () => {
  const { isAuth } = useLoaderData<typeof authLoader>();
  const location = useLocation();
  const socketConnect = useSocketStore((s) => s.connect);

  const accessToken = useAuthStore((s) => s.authToken?.accessToken);

  useEffect(() => {
    if (isAuth && accessToken) {
      socketConnect(accessToken);
    }
  }, [isAuth, socketConnect, accessToken]);

  if (!isAuth) {
    // trở về login và lưu lại đường dẫn hiện tại sau khi login có thể quay lại
    return (
      <Navigate
        to={ROUTES.LOGIN.url}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // render các route con qua Outlet
  return <Outlet />;
};

export default AuthGuard;
