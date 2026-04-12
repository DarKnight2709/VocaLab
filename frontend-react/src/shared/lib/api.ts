import { store } from "@/shared/stores/redux/store";
import { logoutSync } from "@/shared/stores/redux/slices/authSlice";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import axios from "axios";
import envConfig from "@/shared/config/envConfig";
import qs from "qs";
import ROUTES from "./routes";
import { type ZodType, ZodError } from "zod";

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
    const token = store.getState().auth.token?.accessToken;
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
    if (
      response.data &&
      response.data.success === true &&
      response.data.data !== undefined
    ) {
      const { data, message } = response.data;
      // If there's a message and data is an object, preserve the message on the data
      if (message && typeof data === "object" && data !== null) {
        data.message = message;
      }
      response.data = data;
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const requestUrl: string | undefined = error?.config?.url;
    const token = store.getState().auth.token?.accessToken;

    const isAuthRequest =
      typeof requestUrl === "string" &&
      (requestUrl.includes("auth/login") || requestUrl.includes("auth/signup"));

    // Only force-logout/redirect on 401 when we *had* a token (expired/invalid session).
    // For expected auth failures like wrong credentials, let the caller handle the error.
    if (status === 401 && token && !isAuthRequest) {
      useSocketStore.getState().disconnect();
      store.dispatch(logoutSync());
      window.location.href = ROUTES.LOGIN.url;
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
): Promise<T> {
  const res = await request;
  try {
    return schema.parse(res.data);
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
