"use client";

import { httpClient } from "@/lib/api/client";
import { ApiResponse, PaginatedApiResponse } from "@/types/http/auth.types";
import {
  StudentProcedure,
  StudentProcedureFilters,
  StudentProcedureStatistics,
  CreateStudentProcedureDto,
  UpdateStudentProcedureDto,
} from "@/types/http/student-procedure.types";

class StudentProcedureService {
  async getAll(
    filters: StudentProcedureFilters,
  ): Promise<{ items: StudentProcedure[]; total: number }> {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.studentId !== undefined) params.studentId = filters.studentId;
    if (filters.procedureId !== undefined) params.procedureId = filters.procedureId;
    if (filters.supervisorId !== undefined) params.supervisorId = filters.supervisorId;
    if (filters.studentFullname) params.studentFullname = filters.studentFullname;
    if (filters.procedureName) params.procedureName = filters.procedureName;
    if (filters.supervisorFullname) params.supervisorFullname = filters.supervisorFullname;
    if (filters.adminFullname) params.adminFullname = filters.adminFullname;
    if (filters.touchedByAdmin !== undefined) params.touchedByAdmin = filters.touchedByAdmin;
    if (filters.status) params.status = filters.status;
    if (filters.evaluationScore !== undefined) params.evaluationScore = filters.evaluationScore;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await httpClient.get<PaginatedApiResponse<StudentProcedure[]>>(
      "/admin/students-procedures",
      { params },
    );
    return { items: response.data.data, total: response.data.pagination.total };
  }

  async getStatistics(): Promise<StudentProcedureStatistics> {
    const response = await httpClient.get<ApiResponse<StudentProcedureStatistics>>(
      "/admin/students-procedures/statistics/summary",
    );
    return response.data.data;
  }

  async getById(id: number): Promise<StudentProcedure> {
    const response = await httpClient.get<ApiResponse<StudentProcedure>>(
      `/admin/students-procedures/${id}`,
    );
    return response.data.data;
  }

  async create(dto: CreateStudentProcedureDto): Promise<StudentProcedure> {
    const response = await httpClient.post<ApiResponse<StudentProcedure>>(
      "/admin/students-procedures",
      dto,
    );
    return response.data.data;
  }

  async update(id: number, dto: UpdateStudentProcedureDto): Promise<StudentProcedure> {
    const response = await httpClient.patch<ApiResponse<StudentProcedure>>(
      `/admin/students-procedures/${id}`,
      dto,
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/admin/students-procedures/${id}`);
  }
}

export const studentProcedureService = new StudentProcedureService();
