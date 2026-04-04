export interface LoginRequest {
  username: string;
  password: string;
}

export interface Admin {
  id: number;
  username: string;
  fullName: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T;
  pagination: PaginationMeta;
}
