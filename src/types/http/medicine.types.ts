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
  arIndications: string | null;
  enIndications: string | null;
  arAdministration: string | null;
  enAdministration: string | null;
  arContraindications: string | null;
  enContraindications: string | null;
  arMedicineDosages: string | null;
  enMedicineDosages: string | null;
  arNotes: string | null;
  enNotes: string | null;
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
  categoryId: number;
  arDescription?: string;
  enDescription?: string;
  arIndications?: string;
  enIndications?: string;
  arAdministration?: string;
  enAdministration?: string;
  arContraindications?: string;
  enContraindications?: string;
  arMedicineDosages?: string;
  enMedicineDosages?: string;
  arNotes?: string;
  enNotes?: string;
}

export interface UpdateMedicineDto extends Partial<CreateMedicineDto> {
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
