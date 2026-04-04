"use client";

import { httpClient } from "@/lib/api/client";
import {
  Supervisor,
  CreateSupervisorDto,
  UpdateSupervisorDto,
  SupervisorFilters,
  SupervisorStatistics,
} from "@/types/http/supervisor.types";
import { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/types/http/auth.types";

class SupervisorService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await httpClient.post<ApiResponse<string[]>>(
      "/admin/supervisors/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data[0];
  }

  async createSupervisor(data: CreateSupervisorDto): Promise<Supervisor> {
    const response = await httpClient.post<ApiResponse<Supervisor>>(
      "admin/supervisors",
      data,
    );
    return response.data.data;
  }

  async getSupervisors(
    filters?: SupervisorFilters,
  ): Promise<{ data: Supervisor[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();

    if (filters?.username) {
      params.append("username", filters.username);
    }
    if (filters?.fullName) {
      params.append("fullName", filters.fullName);
    }
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((status, index) => {
        params.append(`status[${index}]`, status);
      });
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/admin/supervisors?${queryString}`
      : "/admin/supervisors";

    const response =
      await httpClient.get<PaginatedApiResponse<Supervisor[]>>(url);
    return { data: response.data.data, pagination: response.data.pagination };
  }

  async getSupervisorById(id: number): Promise<Supervisor> {
    const response = await httpClient.get<ApiResponse<Supervisor>>(
      `/admin/supervisors/${id}`,
    );
    return response.data.data;
  }

  async updateSupervisor(
    id: number,
    data: UpdateSupervisorDto,
  ): Promise<Supervisor> {
    const response = await httpClient.patch<ApiResponse<Supervisor>>(
      `/admin/supervisors/${id}`,
      data,
    );
    return response.data.data;
  }

  async blockSupervisor(id: number): Promise<Supervisor> {
    const response = await httpClient.patch<ApiResponse<Supervisor>>(
      `/admin/supervisors/${id}/block`,
    );
    return response.data.data;
  }

  async unblockSupervisor(id: number): Promise<Supervisor> {
    const response = await httpClient.patch<ApiResponse<Supervisor>>(
      `/admin/supervisors/${id}/unblock`,
    );
    return response.data.data;
  }

  async getStatistics(): Promise<SupervisorStatistics> {
    const response = await httpClient.get<ApiResponse<SupervisorStatistics>>(
      "/admin/supervisors/statistics",
    );
    return response.data.data;
  }
}

export const supervisorService = new SupervisorService();
