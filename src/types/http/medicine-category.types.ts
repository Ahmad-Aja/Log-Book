export enum MedicineCategoryStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface MedicineCategory {
  id: number;
  arName: string;
  enName: string;
  arDescription: string | null;
  enDescription: string | null;
  status: MedicineCategoryStatus;
  adminId: number | null;
  studentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineCategoryDto {
  arName: string;
  enName: string;
  arDescription?: string;
  enDescription?: string;
}

export interface UpdateMedicineCategoryDto {
  arName?: string;
  enName?: string;
  arDescription?: string;
  enDescription?: string;
  status?: "APPROVED" | "REJECTED";
}

export interface MedicineCategoryFilters {
  page: number;
  limit: number;
  search?: string;
  nameSearch?: string;
  status?: MedicineCategoryStatus;
  touchedByAdmin?: boolean;
}

export interface MedicineCategoryStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  createdByAdminCount: number;
  createdByStudentCount: number;
}
