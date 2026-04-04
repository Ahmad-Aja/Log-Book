"use client";

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { setupInterceptors } from "./interceptors";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  paramsSerializer: (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .flatMap(([k, v]) => {
        const encKey = encodeURIComponent(k).replace(/%5B/g, "[").replace(/%5D/g, "]");
        return Array.isArray(v)
          ? v.map((item) => `${encKey}=${encodeURIComponent(String(item))}`)
          : [`${encKey}=${encodeURIComponent(String(v))}`];
      })
      .join("&"),
});

setupInterceptors(apiClient);

export const httpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),
};
