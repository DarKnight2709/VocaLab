import { decodeToken } from "@/shared/lib/jwt";
import { useAuthStore } from "./stores/authStore";

export const twoFactorAuthLoader = async () => {
  const {
    isAuth,
    isFirstFactorPassed,
    tempToken: token,
    clearAuthState
  } = useAuthStore.getState();

  if (isAuth) {
    return { isAuth: true };
  } else {
    if (!isFirstFactorPassed) {
      return { isAuth: false, isFirstFactorPassed: false };
    } else {
      try {
        const tempToken = token?.tempToken;
        if (!tempToken) {
          clearAuthState()
          return { isAuth: false, isFirstFactorPassed: false };
        }

        const decoded = decodeToken(tempToken);
        const isExpired = decoded ? decoded.exp * 1000 < Date.now() : true;

        if (isExpired) {
          clearAuthState();
          return { isAuth: false, isFirstFactorPassed: false };
        }
        return { isAuth: false, isFirstFactorPassed: true };
      } catch (error) {
        clearAuthState();
        return {isAuth: false, isFirstFactorPassed: false};
      }
    }
  }
};
