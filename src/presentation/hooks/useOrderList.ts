import { EOrderStatus, OrderEntity } from '@/src/domain/entities/OrderEntity';
import { listOrder } from '@/src/domain/services/OrderService';
import { PageRequestDTO, PageResponse } from '@/src/domain/types/PageDTO';
import { ResponseStatusDTO } from '@/src/domain/types/ResponseStatusDTO';
import { useQuery } from '@tanstack/react-query';

export const useOrderList = (params?: { fields?: string[]; customerId?: number; dealerId?: number; status?: EOrderStatus } & PageRequestDTO) => {
  return useQuery<ResponseStatusDTO<PageResponse<OrderEntity[]>>>({
    queryKey: ['orders', params],
    queryFn: () => listOrder(params),
    enabled: !!params,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};