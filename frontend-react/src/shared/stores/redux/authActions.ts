// Redux thunks for login/logout with socket side-effects
import type { AppDispatch } from "@/shared/stores/redux/store";
import {
  loginSuccess,
  logoutSync,
  setLoading,
} from "@/shared/stores/redux/slices/authSlice";
import { decodeToken } from "@/shared/lib/jwt";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { LoginResponse } from "@/shared/validations/AuthSchema";

export const loginAction =
  (token: LoginResponse) => (dispatch: AppDispatch) => {
    const decoded = decodeToken(token.accessToken);
    if (!decoded) {
      useSocketStore.getState().disconnect();
      dispatch(logoutSync());
      return;
    }
    dispatch(
      loginSuccess({ token, userId: decoded.sub, username: decoded.username }),
    );
    useSocketStore.getState().connect(token.accessToken);
  };

export const logoutAction = () => (dispatch: AppDispatch) => {
  useSocketStore.getState().disconnect();
  dispatch(logoutSync());
};

export { loginSuccess, logoutSync, setLoading };
