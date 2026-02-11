export type SortDirection = 'ASC' | 'DESC';

export interface PageRequestDTO {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: SortDirection;
}
export interface PageResponse<T> {
  content: T;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}