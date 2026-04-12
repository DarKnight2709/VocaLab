import ROUTES from "@/shared/lib/routes";
import { Navigate, Outlet, useLoaderData, useLocation } from "react-router";
import { authLoader } from "../AuthLoader";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import { useEffect } from "react";

// Route Protector
const AuthGuard = () => {
  const { auth } = useLoaderData<typeof authLoader>();
  const location = useLocation();
  const socketConnect = useSocketStore((s) => s.connect);
  const accessToken = useAppSelector((s) => s.auth.token?.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    socketConnect(accessToken);
  }, [auth, socketConnect, accessToken]);

  if (!auth) {
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
