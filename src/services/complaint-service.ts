"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  AddComplaintMessageDto,
  Complaint,
  ComplaintFilters,
  ComplaintMessage,
  ComplaintStatistics,
  ComplaintSummary,
  UpdateComplaintStatusDto,
} from "@/types/http/complaint.types";

class ComplaintService {
  async getAll(
    filters: ComplaintFilters,
  ): Promise<{ items: ComplaintSummary[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.creatorType) params.creatorType = filters.creatorType;
    if (filters.creatorId) params.creatorId = filters.creatorId;
    if (filters.createdFrom) params.createdFrom = filters.createdFrom;
    if (filters.createdTo) params.createdTo = filters.createdTo;

    const res = await httpClient.get<PaginatedApiResponse<ComplaintSummary[]>>(
      "/admin/complaints",
      { params },
    );
    return { items: res.data.data, total: res.data.pagination.total };
  }

  async getStatistics(): Promise<ComplaintStatistics> {
    const res = await httpClient.get<ApiResponse<ComplaintStatistics>>(
      "/admin/complaints/statistics",
    );
    return res.data.data;
  }

  async getById(id: number): Promise<Complaint> {
    const res = await httpClient.get<ApiResponse<Complaint>>(
      `/admin/complaints/${id}`,
    );
    return res.data.data;
  }

  async addMessage(
    id: number,
    dto: AddComplaintMessageDto,
  ): Promise<ComplaintMessage> {
    const res = await httpClient.post<ApiResponse<ComplaintMessage>>(
      `/admin/complaints/${id}/messages`,
      dto,
    );
    return res.data.data;
  }

  async updateStatus(
    id: number,
    dto: UpdateComplaintStatusDto,
  ): Promise<ComplaintSummary> {
    const res = await httpClient.patch<ApiResponse<ComplaintSummary>>(
      `/admin/complaints/${id}/status`,
      dto,
    );
    return res.data.data;
  }
}

export const complaintService = new ComplaintService();
