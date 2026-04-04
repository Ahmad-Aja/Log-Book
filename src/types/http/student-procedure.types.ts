export enum StudentProcedureStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum StudentProcedureSortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface StudentProcedureNestedProcedure {
  id: number;
  arName: string;
  enName: string;
  arDescription: string | null;
  enDescription: string | null;
  minimumRequired: number;
  createdAt: string;
  updatedAt: string;
  disabledAt: string | null;
}

export interface StudentProcedureNestedStudent {
  id: number;
  universityId: string;
  fullName: string;
  phone: string;
  imageUrl: string | null;
  status: string;
  blockedAt: string | null;
  createdAt: string;
}

export interface StudentProcedureNestedSupervisor {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  imageUrl: string | null;
  status: string;
  blockedAt: string | null;
  createdAt: string;
}

export interface StudentProcedureNestedAdmin {
  id: number;
  username: string;
  fullName: string;
  createdAt: string;
}

export interface StudentProcedure {
  id: number;
  studentId: number;
  procedureId: number;
  supervisorId: number;
  adminId: number | null;
  status: StudentProcedureStatus;
  evaluationScore: number;
  supervisorNote: string | null;
  createdAt: string;
  updatedAt: string;
  procedure: StudentProcedureNestedProcedure;
  student: StudentProcedureNestedStudent;
  supervisor: StudentProcedureNestedSupervisor;
  admin: StudentProcedureNestedAdmin | null;
}

export interface CreateStudentProcedureDto {
  studentId: number;
  procedureId: number;
  supervisorId: number;
  evaluationScore: number;
  supervisorNote?: string;
}

export interface UpdateStudentProcedureDto {
  status?: "APPROVED" | "REJECTED";
  evaluationScore?: number;
  supervisorNote?: string;
}

export interface StudentProcedureFilters {
  page: number;
  limit: number;
  // ID-based filters — set via cross-page navigation, not shown as form inputs
  studentId?: number;
  procedureId?: number;
  supervisorId?: number;
  // Text search filters — shown in the filter form
  studentFullname?: string;
  procedureName?: string;
  supervisorFullname?: string;
  adminFullname?: string;
  touchedByAdmin?: boolean;
  status?: StudentProcedureStatus;
  evaluationScore?: number;
  sortOrder?: StudentProcedureSortOrder;
}

export interface StudentProcedureStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface StudentProcedurePaginatedApiResponse {
  data: StudentProcedure[];
  total: number;
  page: number;
  limit: number;
}
