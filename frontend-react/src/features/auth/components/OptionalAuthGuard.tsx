import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/authStore";
import ROUTES from "@/shared/lib/routes";

/**
 * Route guard for public pages that also work when authenticated.
 * - If user is authenticated → redirect to the authenticated home (MainLayout handles those routes)
 * - If user is a guest → render the public layout via <Outlet />
 *
 * This guard is used for the "/" landing page route specifically.
 * Other public routes (blog, grammar, search) use OptionalPublicGuard.
 */
const LandingRedirectGuard = () => {
  const isAuth = useAuthStore((s) => s.isAuth);

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
