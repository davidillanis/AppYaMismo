import { ScheduleEntity } from '@/src/domain/entities/SheduleEntity';
import { listSchedule } from '@/src/domain/services/ScheduleService';
import { PageRequestDTO, PageResponse } from '@/src/domain/types/PageDTO';
import { ResponseStatusDTO } from '@/src/domain/types/ResponseStatusDTO';
import { useQuery } from '@tanstack/react-query';

export const useScheduleList = (params?: { fields?: string[] } & PageRequestDTO) => {
  return useQuery<ResponseStatusDTO<PageResponse<ScheduleEntity[]>>>({
    queryKey: ['schedules', params],
    queryFn: () => listSchedule(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
