export enum StudentStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
  GRADUATED = "GRADUATED",
  WITHDRAWN = "WITHDRAWN",
}

export interface Student {
  id: number;
  universityId: string;
  fullName: string;
  phone: string;
  imageUrl?: string;
  status: StudentStatus;
  blockedAt: Date | null;
  createdAt: Date;
}

export interface CreateStudentDto {
  universityId: string;
  password: string;
  fullName: string;
  phone?: string;
  imageUrl?: string;
  status?: StudentStatus;
}

export interface UpdateStudentDto {
  universityId?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  imageUrl?: string;
  status?: StudentStatus;
}

export interface StudentFilters {
  universityId?: string;
  fullName?: string;
  status?: StudentStatus[];
  page?: number;
  limit?: number;
}

export interface StudentStatistics {
  totalStudents: number;
  blockedStudents: number;
  statusBreakdown: Record<StudentStatus, number>;
}
