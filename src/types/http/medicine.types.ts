export enum MedicineStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface MedicineCategoryMini {
  id: number;
  arName: string;
  enName: string;
}

export interface Medicine {
  id: number;
  arName: string;
  enName: string;
  arDescription: string | null;
  enDescription: string | null;
  status: MedicineStatus;
  categoryId: number;
  category: MedicineCategoryMini;
  adminId: number | null;
  studentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineDto {
  arName: string;
  enName: string;
  arDescription?: string;
  enDescription?: string;
  categoryId: number;
}

export interface UpdateMedicineDto {
  arName?: string;
  enName?: string;
  arDescription?: string;
  enDescription?: string;
  categoryId?: number;
  status?: "APPROVED" | "REJECTED";
}

export interface MedicineFilters {
  page: number;
  limit: number;
  search?: string;
  nameSearch?: string;
  categoryId?: number;
  status?: MedicineStatus;
}

export interface MedicineStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}
