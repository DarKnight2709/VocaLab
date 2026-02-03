import useAuthStore from "@/features/auth/stores/authStore.ts";
import axios from "axios";
import envConfig from "@/shared/config/envConfig";
import qs from "qs";
import ROUTES from "./routes";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_ENV === "development" ? "/api/" : envConfig.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat", skipNulls: true });
    },
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token?.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // nếu không có token, request vẫn đi mà không có header Authorization
    return config;
  },
  async (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const requestUrl: string | undefined = error?.config?.url;
    const token = useAuthStore.getState().token?.accessToken;

    const isAuthRequest =
      typeof requestUrl === "string" &&
      (requestUrl.includes("auth/login") || requestUrl.includes("auth/signup"));

    // Only force-logout/redirect on 401 when we *had* a token (expired/invalid session).
    // For expected auth failures like wrong credentials, let the caller handle the error.
    if (status === 401 && token && !isAuthRequest) {
      useAuthStore.getState().logout();
      window.location.href = ROUTES.LOGIN.url;
    }
    return Promise.reject(error);
  },
);
