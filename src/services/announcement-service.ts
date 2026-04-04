"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  Announcement,
  AnnouncementFilters,
  AnnouncementStatistics,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types/http/announcement.types";

class AnnouncementService {
  async getAll(
    filters: AnnouncementFilters,
  ): Promise<{ items: Announcement[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.createdFrom) params.createdFrom = filters.createdFrom;
    if (filters.createdTo) params.createdTo = filters.createdTo;

    const response = await httpClient.get<PaginatedApiResponse<Announcement[]>>(
      "/announcements",
      { params },
    );
    return { items: response.data.data, total: response.data.pagination.total };
  }

  async getStatistics(): Promise<AnnouncementStatistics> {
    const response = await httpClient.get<ApiResponse<AnnouncementStatistics>>(
      "/announcements/statistics",
    );
    return response.data.data;
  }

  async getById(id: number): Promise<Announcement> {
    const response = await httpClient.get<ApiResponse<Announcement>>(
      `/announcements/${id}`,
    );
    return response.data.data;
  }

  async create(dto: CreateAnnouncementDto): Promise<Announcement> {
    const response = await httpClient.post<ApiResponse<Announcement>>(
      "/announcements",
      dto,
    );
    return response.data.data;
  }

  async update(id: number, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const response = await httpClient.patch<ApiResponse<Announcement>>(
      `/announcements/${id}`,
      dto,
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/announcements/${id}`);
  }
}

export const announcementService = new AnnouncementService();
