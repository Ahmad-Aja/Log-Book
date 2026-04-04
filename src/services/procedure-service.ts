"use client";

import { httpClient } from "@/lib/api/client";
import {
  Procedure,
  CreateProcedureDto,
  UpdateProcedureDto,
  ProcedureFilters,
  ProcedureStatistics,
} from "@/types/http/procedure.types";
import { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/types/http/auth.types";

class ProcedureService {
  async createProcedure(data: CreateProcedureDto): Promise<Procedure> {
    const response = await httpClient.post<ApiResponse<Procedure>>(
      "/admin/procedures",
      data,
    );
    return response.data.data;
  }

  async getProcedures(
    filters?: ProcedureFilters,
  ): Promise<{ data: Procedure[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();

    if (filters?.nameSearch) {
      params.append("nameSearch", filters.nameSearch);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/admin/procedures?${queryString}`
      : "/admin/procedures";

    const response =
      await httpClient.get<PaginatedApiResponse<Procedure[]>>(url);
    return { data: response.data.data, pagination: response.data.pagination };
  }

  async getProcedureById(id: number): Promise<Procedure> {
    const response = await httpClient.get<ApiResponse<Procedure>>(
      `/admin/procedures/${id}`,
    );
    return response.data.data;
  }

  async updateProcedure(
    id: number,
    data: UpdateProcedureDto,
  ): Promise<Procedure> {
    const response = await httpClient.patch<ApiResponse<Procedure>>(
      `/admin/procedures/${id}`,
      data,
    );
    return response.data.data;
  }

  async deleteProcedure(id: number): Promise<void> {
    await httpClient.delete(`/admin/procedures/${id}`);
  }

  async getStatistics(): Promise<ProcedureStatistics> {
    const response = await httpClient.get<ApiResponse<ProcedureStatistics>>(
      "/admin/procedures/statistics/summary",
    );
    return response.data.data;
  }
}

export const procedureService = new ProcedureService();
