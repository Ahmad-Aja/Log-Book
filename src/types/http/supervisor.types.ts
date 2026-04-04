export enum SupervisorStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
  RETIRED = "RETIRED",
}

export interface Supervisor {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  imageUrl: string;
  status: SupervisorStatus;
  blockedAt: Date | null;
  notes: string;
  createdAt: Date;
}

export interface CreateSupervisorDto {
  username: string;
  fullName: string;
  phone?: string;
  imageUrl?: string;
  password: string;
}

export interface UpdateSupervisorDto {
  username?: string;
  fullName?: string;
  phone?: string;
  imageUrl?: string;
  password?: string;
  status?: SupervisorStatus;
  notes?: string;
}

export interface SupervisorFilters {
  username?: string;
  fullName?: string;
  status?: SupervisorStatus[];
  page?: number;
  limit?: number;
}

export interface SupervisorStatistics {
  totalSupervisors: number;
  blockedSupervisors: number;
  statusBreakdown: Record<SupervisorStatus, number>;
}
