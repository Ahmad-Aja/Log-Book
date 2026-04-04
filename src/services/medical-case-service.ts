"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  MedicalCase,
  MedicalCaseFilters,
  CreateMedicalCaseDto,
  UpdateMedicalCaseDto,
  UpdateMedicalCaseStatusDto,
} from "@/types/http/medical-case.types";

class MedicalCaseService {
  async getAll(
    filters: MedicalCaseFilters,
  ): Promise<{ items: MedicalCase[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.status) params["status[]"] = filters.status;
    if (filters.publisherRole) params.publisherRole = filters.publisherRole;
    if (filters.publisherId !== undefined)
      params.publisherId = filters.publisherId;
    if (filters.hospital) params.hospital = filters.hospital;
    if (filters.search) params.search = filters.search;
    if (filters.caseDateFrom) params.caseDateFrom = filters.caseDateFrom;
    if (filters.caseDateTo) params.caseDateTo = filters.caseDateTo;
    if (filters.contributor) params.contributor = filters.contributor;

    const response = await httpClient.get<PaginatedApiResponse<MedicalCase[]>>(
      "/admin/medical-special-cases",
      { params },
    );
    return { items: response.data.data, total: response.data.pagination.total };
  }

  async getById(id: number): Promise<MedicalCase> {
    const response = await httpClient.get<ApiResponse<MedicalCase>>(
      `/admin/medical-special-cases/${id}`,
    );
    return response.data.data;
  }

  async create(dto: CreateMedicalCaseDto): Promise<MedicalCase> {
    const response = await httpClient.post<ApiResponse<MedicalCase>>(
      "/admin/medical-special-cases",
      dto,
    );
    return response.data.data;
  }

  async update(id: number, dto: UpdateMedicalCaseDto): Promise<MedicalCase> {
    const response = await httpClient.patch<ApiResponse<MedicalCase>>(
      `/admin/medical-special-cases/${id}`,
      dto,
    );
    return response.data.data;
  }

  async updateStatus(
    id: number,
    dto: UpdateMedicalCaseStatusDto,
  ): Promise<MedicalCase> {
    const response = await httpClient.patch<ApiResponse<MedicalCase>>(
      `/admin/medical-special-cases/${id}/status`,
      dto,
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/medical-special-cases/${id}`);
  }
}

export const medicalCaseService = new MedicalCaseService();
