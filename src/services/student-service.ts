"use client";

import { httpClient } from "@/lib/api/client";
import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilters,
  StudentStatistics,
} from "@/types/http/student.types";
import {
  ApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
} from "@/types/http/auth.types";

class StudentService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await httpClient.post<ApiResponse<string[]>>(
      "/admin/students/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data[0];
  }

  async createStudent(data: CreateStudentDto): Promise<Student> {
    const response = await httpClient.post<ApiResponse<Student>>(
      "admin/students",
      data,
    );
    return response.data.data;
  }

  async getStudents(
    filters?: StudentFilters,
  ): Promise<{ data: Student[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();

    if (filters?.universityId) {
      params.append("universityId", filters.universityId);
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
      ? `/admin/students?${queryString}`
      : "/admin/students";

    const response = await httpClient.get<PaginatedApiResponse<Student[]>>(url);
    return { data: response.data.data, pagination: response.data.pagination };
  }

  async getStudentById(id: number): Promise<Student> {
    const response = await httpClient.get<ApiResponse<Student>>(
      `/admin/students/${id}`,
    );
    return response.data.data;
  }

  async updateStudent(id: number, data: UpdateStudentDto): Promise<Student> {
    const response = await httpClient.patch<ApiResponse<Student>>(
      `/admin/students/${id}`,
      data,
    );
    return response.data.data;
  }

  async blockStudent(id: number): Promise<Student> {
    const response = await httpClient.patch<ApiResponse<Student>>(
      `/admin/students/${id}/block`,
    );
    return response.data.data;
  }

  async unblockStudent(id: number): Promise<Student> {
    const response = await httpClient.patch<ApiResponse<Student>>(
      `/admin/students/${id}/unblock`,
    );
    return response.data.data;
  }

  async getStatistics(): Promise<StudentStatistics> {
    const response = await httpClient.get<ApiResponse<StudentStatistics>>(
      "/admin/students/statistics",
    );
    return response.data.data;
  }

  async downloadReport(studentId: number): Promise<string> {
    const response = await httpClient.get<string>(
      `/admin/statistics-and-reports/students/${studentId}/report`,
    );
    return response.data;
  }
}

export const studentService = new StudentService();
