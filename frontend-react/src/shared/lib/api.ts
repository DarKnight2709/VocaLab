import { useSocketStore } from "@/shared/stores/useSocketStore";
import axios from "axios";
import envConfig from "@/shared/config/envConfig";
import qs from "qs";
import ROUTES from "./routes";
import { type ZodType, ZodError } from "zod";
import { useAuthStore } from "@/features/auth/stores/authStore";
import API_ROUTES from "./api-routes";
import i18n from "../i18n";
import { router } from "@/App";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_ENV === "development"
      ? "/api/"
      : envConfig.VITE_API_URL,
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat", skipNulls: true });
    },
  },
});

api.interceptors.request.use(
  (config) => config,
  async (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
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
      !isAuthRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(API_ROUTES.AUTH.REFRESH_TOKEN);

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useSocketStore.getState().disconnect();
        useAuthStore.getState().clearAuthState();

        const pathname = window.location.pathname;
        const isPublicPath =
          pathname === "/" ||
          pathname === ROUTES.LANDING.url ||
          pathname === ROUTES.LOGIN.url ||
          pathname === ROUTES.BLOG.url ||
          pathname === ROUTES.SEARCH.url ||
          pathname.startsWith("/blogs/") ||
          pathname.startsWith("/collections/") ||
          pathname.startsWith("/user/");

        if (!isPublicPath && pathname !== ROUTES.LOGIN.url) {
          router.navigate(ROUTES.LOGIN.url);
        }
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
  const axiosError = error as any;
  const message = axiosError.response?.data?.message;

  if (message && typeof message === "string") {
    // If it's a known error code, translate it
    const translated = i18n.t(`errors.${message}`);
    if (translated !== `errors.${message}`) {
      return translated;
    }
    return message;
  }

  return axiosError.message || fallback;
}

export async function fetchWithSchema<T>(
  request: Promise<any>,
  schema: ZodType<T>,
): Promise<{data: T}> {
  const res = await request;
  try {
    const validatedData = schema.parse(res.data);
    return {
      data: validatedData,
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
