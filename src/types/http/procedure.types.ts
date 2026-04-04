export interface Procedure {
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

export interface CreateProcedureDto {
  arName: string;
  enName: string;
  arDescription?: string;
  enDescription?: string;
  minimumRequired?: number;
  isActive?: boolean;
}

export interface UpdateProcedureDto {
  arName?: string;
  enName?: string;
  arDescription?: string;
  enDescription?: string;
  minimumRequired?: number;
  isActive?: boolean;
}

export interface ProcedureFilters {
  nameSearch?: string;
  page?: number;
  limit?: number;
}

export interface ProcedureStatistics {
  totalCount: number;
  enabledCount: number;
  disabledCount: number;
}
