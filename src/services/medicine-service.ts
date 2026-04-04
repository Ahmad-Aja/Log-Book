"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineFilters,
  MedicineStatistics,
} from "@/types/http/medicine.types";

class MedicineService {
  async getAll(
    filters: MedicineFilters,
  ): Promise<{ items: Medicine[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.search = filters.search;
    if (filters.nameSearch) params.nameSearch = filters.nameSearch;
    if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
    if (filters.status) params.status = filters.status;

    const res = await httpClient.get<PaginatedApiResponse<Medicine[]>>(
      "/admin/medicines",
      { params },
    );
    return { items: res.data.data, total: res.data.pagination.total };
  }

  async getStatistics(): Promise<MedicineStatistics> {
    const res = await httpClient.get<ApiResponse<MedicineStatistics>>(
      "/admin/medicines/statistics/summary",
    );
    return res.data.data;
  }

  async getById(id: number): Promise<Medicine> {
    const res = await httpClient.get<ApiResponse<Medicine>>(
      `/admin/medicines/${id}`,
    );
    return res.data.data;
  }

  async create(dto: CreateMedicineDto): Promise<Medicine> {
    const res = await httpClient.post<ApiResponse<Medicine>>(
      "/admin/medicines",
      dto,
    );
    return res.data.data;
  }

  async update(id: number, dto: UpdateMedicineDto): Promise<Medicine> {
    const res = await httpClient.patch<ApiResponse<Medicine>>(
      `/admin/medicines/${id}`,
      dto,
    );
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/medicines/${id}`);
  }
}

export const medicineService = new MedicineService();
