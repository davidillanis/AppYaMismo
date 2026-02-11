import { RestaurantEntity } from "@/src/domain/entities/RestaurantEntity";
import { listRestaurant } from "@/src/domain/services/RestaurnatService";
import { PageRequestDTO, PageResponse } from "@/src/domain/types/PageDTO";
import { ResponseStatusDTO } from "@/src/domain/types/ResponseStatusDTO";
import { useQuery } from "@tanstack/react-query";

export const useRestaurantList = (
  params?: {
    fields?: string[];
    enabled?: boolean;
    userId?: number;
  } & PageRequestDTO,
) => {
  return useQuery<ResponseStatusDTO<PageResponse<RestaurantEntity[]>>>({
    queryKey: ["restaurants", params],
    queryFn: () => listRestaurant(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
