import { UserEntity } from "@/src/domain/entities/UserEntity";
import { getUserById } from "@/src/domain/services/UserService";
import { ResponseStatusDTO } from "@/src/domain/types/ResponseStatusDTO";
import { useQuery } from "@tanstack/react-query";

export const useUserById = (id?: number) => {
  return useQuery<ResponseStatusDTO<UserEntity>>({
    queryKey: ["user-by-id", id],
    queryFn: () => getUserById(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
