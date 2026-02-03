// import { api } from '@/shared/lib/api'
// import API_ROUTES from '@/shared/lib/api-routes'
import { decodeToken } from "@/shared/lib/jwt";
// import type { RefreshTokenResponse } from '@/shared/validations/AuthSchema'
import useAuthStore from "./stores/authStore";
import type { RefreshTokenResponse } from "@/shared/validations/AuthSchema";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

export const authLoader = async () => {
  const {
    token,
    logout,
    login,
    isAuth: isAuthenticated,
    setLoading,
    isLoading,
  } = useAuthStore.getState();

  // Nếu nhân viên chưa đăng nhập, clear auth store và chuyển hướng đến trang login
  if (!isAuthenticated) {
    setLoading(false);
    logout();
    return { auth: false };
  }

  // Kiểm tra tính hợp lệ của access token
  try {
    const accessToken = token?.accessToken;
    const refreshToken = token?.refreshToken;

    // Nếu không có access token, clear auth store và chuyển hướng đến trang login
    if (!accessToken) {
      setLoading(false);
      logout();
      return { auth: false };
    }

    // Giải mã access token và kiểm tra tính hợp lệ
    const decodedAccess = decodeToken(accessToken);
    if (!decodedAccess) {
      setLoading(false);
      logout();
      return { auth: false };
    }

    // Kiểm tra xem access token có hết hạn không
    const isAccessTokenExpired = decodedAccess.exp * 1000 < Date.now();

    // Nếu access token vẫn hợp lệ, không làm gì cả
    if (!isAccessTokenExpired) {
      setLoading(false)
      return { auth: true }
    }

    // access token hết hạn, refresh token không có
    if (!refreshToken) {
      setLoading(false)
      logout()
      return { auth: false }
    }

    // // Kiểm tra tính hợp lệ của refresh token
    const decodedRefresh = decodeToken(refreshToken)
    if (!decodedRefresh || decodedRefresh.exp * 1000 < Date.now()) {
      setLoading(false)
      logout()
      return { auth: false }
    }

    // Thử làm mới token bằng refresh token (refresh token còn hạn).
    try {
      if (isLoading) return { auth: false }
      setLoading(true)
      const response = await api.post<RefreshTokenResponse>(API_ROUTES.AUTH.REFRESH_TOKEN, {
        refreshToken
      })
      login(response.data)
      setLoading(false)
      return { auth: true }
    } catch {
      setLoading(false)
      logout()
      return { auth: false }
    }
  } catch {
    setLoading(false);
    logout();
    return { auth: false };
  }
};
