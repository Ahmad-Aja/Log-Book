export enum ProtocolStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ProtocolStep {
  id: number;
  protocolId: number;
  stepNumber: number;
  arTitle: string;
  enTitle: string;
  arDescription: string | null;
  enDescription: string | null;
  attachments: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolMedicineMini {
  id: number;
  arName: string;
  enName: string;
  status: string;
  category: {
    id: number;
    arName: string;
    enName: string;
  };
}

export interface ProtocolMedicineItem {
  id: number;
  protocolId: number;
  medicineId: number;
  enDosageNotes: string | null;
  arDosageNotes: string | null;
  enDiseasesNotes: string | null;
  arDiseasesNotes: string | null;
  medicine: ProtocolMedicineMini;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolAdminInfo {
  id: number;
  username: string;
  fullName: string;
}

export interface ProtocolStudentInfo {
  id: number;
  universityId: string;
  fullName: string;
}

export interface Protocol {
  id: number;
  arTitle: string;
  enTitle: string;
  arDescription: string | null;
  enDescription: string | null;
  status: ProtocolStatus;
  procedureId: number;
  adminId: number | null;
  admin: ProtocolAdminInfo | null;
  studentId: number | null;
  student: ProtocolStudentInfo | null;
  steps: ProtocolStep[];
  protocolMedicines: ProtocolMedicineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolStepInput {
  stepNumber: number;
  arTitle: string;
  enTitle: string;
  arDescription?: string;
  enDescription?: string;
}

export interface CreateProtocolMedicineInput {
  medicineId: number;
  enDosageNotes?: string;
  arDosageNotes?: string;
}

export interface CreateProtocolDto {
  arTitle: string;
  enTitle: string;
  arDescription?: string;
  enDescription?: string;
  procedureId: number;
  steps?: CreateProtocolStepInput[];
  medicines?: CreateProtocolMedicineInput[];
}

export interface UpdateProtocolDto {
  arTitle?: string;
  enTitle?: string;
  arDescription?: string;
  enDescription?: string;
  status?: "APPROVED" | "REJECTED";
}

export interface CreateProtocolStepDto {
  protocolId: number;
  stepNumber: number;
  arTitle: string;
  enTitle: string;
  arDescription?: string;
  enDescription?: string;
  attachments?: string[];
}

export interface UpdateProtocolStepDto {
  stepNumber?: number;
  arTitle?: string;
  enTitle?: string;
  arDescription?: string;
  enDescription?: string;
}

export interface CreateProtocolMedicineDto {
  protocolId: number;
  medicineId: number;
  enDosageNotes?: string;
  arDosageNotes?: string;
  enDiseasesNotes?: string;
  arDiseasesNotes?: string;
}

export interface UpdateProtocolMedicineDto {
  enDosageNotes?: string;
  arDosageNotes?: string;
  enDiseasesNotes?: string;
  arDiseasesNotes?: string;
}

export interface ProtocolFilters {
  page: number;
  limit: number;
  search?: string;
  titleSearch?: string;
  procedureId?: number;
  status?: ProtocolStatus;
  touchedByAdmin?: boolean;
}

export interface ProtocolStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  createdByAdminCount: number;
  createdByStudentCount: number;
}
