import { AxiosInstance, InternalAxiosRequestConfig } from "axios";

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "ar";
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : "ar";
}

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

export function setupInterceptors(axiosInstance: AxiosInstance) {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers["Accept-Language"] = getLocaleFromCookie();

      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const locale = getLocaleFromCookie();
        document.cookie = `access_token=; path=/; max-age=0`;
        window.location.href = `/${locale}/login`;
      }
      return Promise.reject(error);
    },
  );
}
