"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  Protocol,
  ProtocolStatistics,
  ProtocolFilters,
  CreateProtocolDto,
  UpdateProtocolDto,
  CreateProtocolStepDto,
  UpdateProtocolStepDto,
  CreateProtocolMedicineDto,
  UpdateProtocolMedicineDto,
  ProtocolStep,
  ProtocolMedicineItem,
} from "@/types/http/protocol.types";

class ProtocolService {
  async getAll(
    filters: ProtocolFilters,
  ): Promise<{ items: Protocol[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.search = filters.search;
    if (filters.titleSearch) params.titleSearch = filters.titleSearch;
    if (filters.procedureId) params.procedureId = filters.procedureId;
    if (filters.status) params.status = filters.status;
    if (filters.touchedByAdmin !== undefined)
      params.touchedByAdmin = filters.touchedByAdmin;

    const res = await httpClient.get<PaginatedApiResponse<Protocol[]>>(
      "/admin/protocols",
      { params },
    );
    return { items: res.data.data, total: res.data.pagination.total };
  }

  async getStatistics(): Promise<ProtocolStatistics> {
    const res = await httpClient.get<ApiResponse<ProtocolStatistics>>(
      "/admin/protocols/statistics/summary",
    );
    return res.data.data;
  }

  async getById(id: number): Promise<Protocol> {
    const res = await httpClient.get<ApiResponse<Protocol>>(
      `/admin/protocols/${id}`,
    );
    return res.data.data;
  }

  async create(dto: CreateProtocolDto): Promise<Protocol> {
    const res = await httpClient.post<ApiResponse<Protocol>>(
      "/admin/protocols",
      dto,
    );
    return res.data.data;
  }

  async update(id: number, dto: UpdateProtocolDto): Promise<Protocol> {
    const res = await httpClient.patch<ApiResponse<Protocol>>(
      `/admin/protocols/${id}`,
      dto,
    );
    return res.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/protocols/${id}`);
  }

  async createStep(dto: CreateProtocolStepDto): Promise<ProtocolStep> {
    const res = await httpClient.post<ApiResponse<ProtocolStep>>(
      "/admin/protocol-steps",
      dto,
    );
    return res.data.data;
  }

  async updateStep(
    id: number,
    dto: UpdateProtocolStepDto,
  ): Promise<ProtocolStep> {
    const res = await httpClient.patch<ApiResponse<ProtocolStep>>(
      `/admin/protocol-steps/${id}`,
      dto,
    );
    return res.data.data;
  }

  async deleteStep(id: number): Promise<void> {
    await httpClient.delete(`/admin/protocol-steps/${id}`);
  }

  async createProtocolMedicine(
    dto: CreateProtocolMedicineDto,
  ): Promise<ProtocolMedicineItem> {
    const res = await httpClient.post<ApiResponse<ProtocolMedicineItem>>(
      "/admin/protocol-medicines",
      dto,
    );
    return res.data.data;
  }

  async updateProtocolMedicine(
    id: number,
    dto: UpdateProtocolMedicineDto,
  ): Promise<ProtocolMedicineItem> {
    const res = await httpClient.patch<ApiResponse<ProtocolMedicineItem>>(
      `/admin/protocol-medicines/${id}`,
      dto,
    );
    return res.data.data;
  }

  async deleteProtocolMedicine(id: number): Promise<void> {
    await httpClient.delete(`/admin/protocol-medicines/${id}`);
  }
}

export const protocolService = new ProtocolService();
