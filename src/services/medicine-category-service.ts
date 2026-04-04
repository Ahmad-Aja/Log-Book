"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  MedicineCategory,
  CreateMedicineCategoryDto,
  UpdateMedicineCategoryDto,
  MedicineCategoryFilters,
  MedicineCategoryStatistics,
} from "@/types/http/medicine-category.types";

class MedicineCategoryService {
  async getAll(
    filters: MedicineCategoryFilters,
  ): Promise<{ items: MedicineCategory[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.search = filters.search;
    if (filters.nameSearch) params.nameSearch = filters.nameSearch;
    if (filters.status) params.status = filters.status;
    if (filters.touchedByAdmin !== undefined)
      params.touchedByAdmin = filters.touchedByAdmin;

    const res = await httpClient.get<PaginatedApiResponse<MedicineCategory[]>>(
      "/admin/medicine-categories",
      { params },
    );
    return { items: res.data.data, total: res.data.pagination.total };
  }

  async getStatistics(): Promise<MedicineCategoryStatistics> {
    const res = await httpClient.get<ApiResponse<MedicineCategoryStatistics>>(
      "/admin/medicine-categories/statistics/summary",
    );
    return res.data.data;
  }

  async getById(id: number): Promise<MedicineCategory> {
    const res = await httpClient.get<ApiResponse<MedicineCategory>>(
      `/admin/medicine-categories/${id}`,
    );
    return res.data.data;
  }

  async create(dto: CreateMedicineCategoryDto): Promise<MedicineCategory> {
    const res = await httpClient.post<ApiResponse<MedicineCategory>>(
      "/admin/medicine-categories",
      dto,
    );
    return res.data.data;
  }

  async update(
    id: number,
    dto: UpdateMedicineCategoryDto,
  ): Promise<MedicineCategory> {
    const res = await httpClient.patch<ApiResponse<MedicineCategory>>(
      `/admin/medicine-categories/${id}`,
      dto,
    );
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/medicine-categories/${id}`);
  }
}

export const medicineCategoryService = new MedicineCategoryService();
