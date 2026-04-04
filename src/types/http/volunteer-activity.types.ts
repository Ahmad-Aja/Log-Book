export enum VolunteerActivityStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface VolunteerActivityNestedStudent {
  id: number;
  universityId: string;
  fullName: string;
  phone: string;
  imageUrl: string | null;
  status: string;
  blockedAt: string | null;
  createdAt: string;
}

export interface VolunteerActivityNestedSupervisor {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  imageUrl: string | null;
  status: string;
  blockedAt: string | null;
  createdAt: string;
}

export interface VolunteerActivity {
  id: number;
  studentId: number;
  student: VolunteerActivityNestedStudent;
  supervisorId: number;
  supervisor: VolunteerActivityNestedSupervisor;
  arTitle: string;
  enTitle: string;
  arDescription: string;
  enDescription: string;
  images: string[] | null;
  activityDate: string;
  status: VolunteerActivityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVolunteerActivityStatusDto {
  status: "approved" | "rejected" | "pending";
}

export interface VolunteerActivityFilters {
  page: number;
  limit: number;
  search?: string;
  studentId?: number;
  supervisorId?: number;
  status?: VolunteerActivityStatus;
  activityDateFrom?: string;
  activityDateTo?: string;
}

export interface VolunteerActivityStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
