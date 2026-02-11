export interface ResponseStatusDTO<T = any> {
  isSuccess?: boolean;
  message?: string;
  data?: T;
  errors?: string[] | null;
}
