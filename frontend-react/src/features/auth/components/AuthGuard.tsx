import ROUTES from "@/shared/lib/routes";
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router";
import { authLoader } from "../AuthLoader";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { useEffect } from "react";
import { useNotificationSocket } from "@/shared/hooks/useNotificationSocket";

// Route Protector
const AuthGuard = () => {
  const { isAuth } = useLoaderData<typeof authLoader>();
  const location = useLocation();
  const socketConnect = useSocketStore((s) => s.connect);

  // Always call all hooks at the top level before any conditional returns
  useNotificationSocket();

  useEffect(() => {
    if (isAuth) {
      socketConnect();
    }
  }, [isAuth, socketConnect]);

  if (!isAuth) {
    // Trở về login và lưu lại đường dẫn hiện tại sau khi login có thể quay lại
    return (
      <Navigate
        to={ROUTES.LOGIN.url}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Render các route con qua Outlet
  return <Outlet />;
};

export default AuthGuard;
