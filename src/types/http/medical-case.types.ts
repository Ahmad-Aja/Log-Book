export enum MedicalCaseStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum MedicalCasePublisherRole {
  STUDENT = "student",
  SUPERVISOR = "supervisor",
  ADMIN = "admin",
}

export interface MedicalCase {
  id: number;
  status: MedicalCaseStatus;
  approvedByAdminId: number | null;
  publisherRole: MedicalCasePublisherRole;
  publisherId: number;
  title: string;
  description: string;
  caseDate: string;
  hospital: string | null;
  images: string[];
  urls: string[];
  contributors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalCaseDto {
  title: string;
  description: string;
  caseDate: string;
  hospital?: string;
  images?: string[];
  urls?: string[];
  contributors?: string[];
}

export interface UpdateMedicalCaseDto {
  title?: string;
  description?: string;
  caseDate?: string;
  hospital?: string;
  images?: string[];
  urls?: string[];
  contributors?: string[];
}

export interface UpdateMedicalCaseStatusDto {
  status: "APPROVED" | "REJECTED";
}

export interface MedicalCaseFilters {
  page: number;
  limit: number;
  status?: MedicalCaseStatus;
  publisherRole?: MedicalCasePublisherRole;
  publisherId?: number;
  hospital?: string;
  search?: string;
  caseDateFrom?: string;
  caseDateTo?: string;
  contributor?: string;
}
