import { Navigate, Outlet, useLoaderData } from "react-router";
import { useAuthStore } from "../stores/authStore";
import ROUTES from "@/shared/lib/routes";

const LandingRedirectGuard = () => {
  const loaderData = useLoaderData() as { isAuth?: boolean } | undefined;
  const isAuthStore = useAuthStore((s) => s.isAuth);
  const isAuth = loaderData?.isAuth ?? isAuthStore;

  if (isAuth) {
    return <Navigate to={ROUTES.HOME.url} replace />;
  }

  return <Outlet />;
};

/**
 * Route guard for public pages — renders content for both guests and auth users.
 * Does NOT redirect anywhere. Simply passes through to render the child routes.
 */
const OptionalPublicGuard = () => {
  return <Outlet />;
};

export { LandingRedirectGuard, OptionalPublicGuard };
export default OptionalPublicGuard;
