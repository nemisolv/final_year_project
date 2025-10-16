export interface ApiResponse<T> {
  timestamp?: string;
  code: number;
  message: string;
  data?: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;          // 1-indexed
  limit: number;         // page size
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
