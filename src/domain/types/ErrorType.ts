export type ErrorInfoType = {
  message: string;
  code?: string | number;
  status?: number;
  data?: unknown;
  url?: string;
  method?: string;
  headers?: Record<string, unknown>;
  baseURL?: string;
};