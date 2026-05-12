import { useSocketStore } from "@/shared/stores/useSocketStore";
import axios from "axios";
import envConfig from "@/shared/config/envConfig";
import qs from "qs";
import ROUTES from "./routes";
import { type ZodType, ZodError } from "zod";
import { useAuthStore } from "@/features/auth/stores/authStore";
import API_ROUTES from "./api-routes";
import { RefreshTokenResponseSchema } from "../validations/AuthSchema";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_ENV === "development"
      ? "/api/"
      : envConfig.VITE_API_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat", skipNulls: true });
    },
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().authToken?.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // nếu không có token, request vẫn đi mà không có header Authorization
    return config;
  },
  async (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const token = useAuthStore.getState().authToken;

    // Check if the request is for login, signup or if it's already a refresh request
    const isAuthRequest =
      typeof originalRequest?.url === "string" &&
      (originalRequest.url.includes("auth/login") ||
        originalRequest.url.includes("auth/signup") ||
        originalRequest.url.includes("auth/refresh-token"));

    // Only force-logout/redirect on 401 when we *had* a token (expired/invalid session).
    // And don't retry if it's an auth request itself to avoid infinite loops.
    if (
      status === 401 &&
      token?.refreshToken &&
      !isAuthRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((accessToken) => {
            originalRequest.headers["Authorization"] = "Bearer " + accessToken;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await fetchWithSchema(
          api.post(API_ROUTES.AUTH.REFRESH_TOKEN, {
            refreshToken: token.refreshToken,
          }),
          RefreshTokenResponseSchema,
        );

        useAuthStore.getState().login(data.data);
        processQueue(null, data.data.accessToken);

        originalRequest.headers["Authorization"] = "Bearer " + data.data.accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useSocketStore.getState().disconnect();
        useAuthStore.getState().logout();
        window.location.href = ROUTES.LOGIN.url;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export type ApiErrorBody = {
  message?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as any; // Simplified cast or Use AxiosError if imported
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

export async function fetchWithSchema<T>(
  request: Promise<any>,
  schema: ZodType<T>,
): Promise<{data: T, message?: string}> {
  const res = await request;
  try {
    const validatedData = schema.parse(res.data);
    return {
      data: validatedData,
      message: res.message,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("❌ Schema Validation Error:", {
        path: error.issues[0]?.path,
        message: error.issues[0]?.message,
        received: error.issues,
        data: res.data,
      });
    }
    throw error;
  }
}
