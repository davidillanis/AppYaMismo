import { ERole, UserEntity } from "@/src/domain/entities/UserEntity";
import { listUsers } from "@/src/domain/services/UserService";
import { ResponseStatusDTO } from "@/src/domain/types/ResponseStatusDTO";
import { useQuery } from "@tanstack/react-query";

import { PageResponse } from "@/src/domain/types/PageDTO";

export type UserListParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  fields?: string[];
  role?: ERole;
};

/**
 * NOTA:
 * - Si listUsers retorna paginado: ResponseStatusDTO<PageResponse<UserEntity[]>>
 * - Si listUsers retorna lista simple: ResponseStatusDTO<UserEntity[]>
 *
 * Dejo paginado como default porque en tu TXT/servicios suele venir page/size/sort.
 */
export const useUserList = (params?: UserListParams) => {
  return useQuery<ResponseStatusDTO<PageResponse<UserEntity[]>>>({
    queryKey: ["user-list", params ?? {}],
    queryFn: () => listUsers(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};
