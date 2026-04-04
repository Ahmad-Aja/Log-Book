"use client";

import { httpClient } from "@/lib/api/client";
import {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  Admin,
} from "@/types/http/auth.types";

function setTokenCookie(token: string) {
  // Set cookie with 15 days expiry (matching JWT exp)
  const maxAge = 60 * 60 * 24 * 15;
  document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<ApiResponse<LoginResponse>>(
      "/auth/admins/login",
      { ...credentials, fcmToken: "testing" },
    );
    const data = response.data.data;

    // Store token in cookie for middleware access
    setTokenCookie(data.accessToken);

    return data;
  }

  async logout(): Promise<void> {
    // Clear the token cookie
    document.cookie = "access_token=; path=/; max-age=0";
  }

  async me(): Promise<Admin> {
    const response = await httpClient.get<ApiResponse<Admin>>("/admins/me");
    return response.data.data;
  }

  async updateProfile(data: {
    fullName?: string;
    password?: string;
  }): Promise<Admin> {
    const response = await httpClient.patch<ApiResponse<Admin>>(
      "/admins/me",
      data,
    );
    return response.data.data;
  }
}

export const authService = new AuthService();
