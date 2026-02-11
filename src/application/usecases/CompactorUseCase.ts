import { VehicleEntity } from '@/src/domain/entities/VehicleEntity';
import { listVehicle } from '@/src/domain/services/VehicleService';
import { PageRequestDTO, PageResponse } from '@/src/domain/types/PageDTO';
import { ResponseStatusDTO } from '@/src/domain/types/ResponseStatusDTO';
import { useQuery } from '@tanstack/react-query';

export const useVehicleList = (params?: { fields?: string[] } & PageRequestDTO) => {
  return useQuery<ResponseStatusDTO<PageResponse<VehicleEntity[]>>>({
    queryKey: ['vehicles', params], 
    queryFn: () => listVehicle(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
