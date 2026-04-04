"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  VolunteerActivity,
  VolunteerActivityFilters,
  VolunteerActivityStatistics,
  UpdateVolunteerActivityStatusDto,
} from "@/types/http/volunteer-activity.types";

class VolunteerActivityService {
  async getAll(
    filters: VolunteerActivityFilters,
  ): Promise<{ items: VolunteerActivity[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search) params.search = filters.search;
    if (filters.studentId !== undefined) params.studentId = filters.studentId;
    if (filters.supervisorId !== undefined)
      params.supervisorId = filters.supervisorId;
    if (filters.status) params.status = filters.status;
    if (filters.activityDateFrom)
      params.activityDateFrom = filters.activityDateFrom;
    if (filters.activityDateTo) params.activityDateTo = filters.activityDateTo;

    const response = await httpClient.get<
      PaginatedApiResponse<VolunteerActivity[]>
    >("/admin/volunteer-activities", { params });
    return {
      items: response.data.data,
      total: response.data.pagination.total,
    };
  }

  async getStatistics(): Promise<VolunteerActivityStatistics> {
    const response = await httpClient.get<
      ApiResponse<VolunteerActivityStatistics>
    >("/admin/volunteer-activities/statistics");
    return response.data.data;
  }

  async updateStatus(
    id: number,
    dto: UpdateVolunteerActivityStatusDto,
  ): Promise<VolunteerActivity> {
    const response = await httpClient.patch<ApiResponse<VolunteerActivity>>(
      `/admin/volunteer-activities/${id}/status`,
      dto,
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/volunteer-activities/${id}`);
  }
}

export const volunteerActivityService = new VolunteerActivityService();
