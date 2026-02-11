import { RestaurantEntity } from '@/src/domain/entities/RestaurantEntity';
import { ScheduleEntity, ScheduleRequestDTO } from '@/src/domain/entities/SheduleEntity';
import { assignSchedule, createSchedule, deleteSchedule, unassignRestaurantFromSchedule, updateSchedule } from '@/src/domain/services/ScheduleService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/* CREATE */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: Partial<ScheduleRequestDTO> }) =>
      createSchedule(payload),

    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });

      const previousData = queryClient.getQueryData(['schedules', { page: 0 }]);

      const tempSchedule: ScheduleEntity = {
        id: Date.now(),
        startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
        endTime: payload.endTime ? new Date(payload.endTime) : new Date(),
        createdAt: new Date(),
        days: payload.day
          ? payload.day.map((d, index) => ({
              id: -index - 1,
              name: d,
            }))
          : [],
        restaurants: [],
      };

      queryClient.setQueryData(['schedules', { page: 0 }], (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          content: [tempSchedule, ...(old?.data?.content || [])],
          totalElements: (old?.data?.totalElements || 0) + 1,
        },
      }));

      return { previousData };
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['schedules', { page: 0 }], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

/* UPDATE */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ScheduleRequestDTO> }) =>
      updateSchedule(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });
      const queries = queryClient.getQueriesData({ queryKey: ['schedules'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          const updatedContent = oldData.data.content.map((s: ScheduleEntity) =>
            s.id === id ? { ...s, ...payload } : s
          );

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: updatedContent,
            },
          });

          previousDatas.push({ queryKey, oldData });
        }
      });

      return { previousDatas };
    },

    onError: (err, variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

/* DELETE */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSchedule(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });
      const queries = queryClient.getQueriesData({ queryKey: ['schedules'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          const updatedContent = oldData.data.content.filter(
            (s: ScheduleEntity) => s.id !== id
          );

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: updatedContent,
              totalElements: oldData.data.totalElements - 1,
            },
          });

          previousDatas.push({ queryKey, oldData });
        }
      });

      return { previousDatas };
    },

    onError: (err, variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};



/* ======================
   ASSIGN SCHEDULE TO RESTAURANTS
====================== */
export const useAssignSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      restaurantIds,
    }: {
      scheduleId: number;
      restaurantIds?: number[];
    }) => assignSchedule(scheduleId, restaurantIds),

    onMutate: async ({ scheduleId, restaurantIds }) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });

      const queries = queryClient.getQueriesData({ queryKey: ['schedules'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (!oldData?.data?.content) return;

        previousDatas.push({ queryKey, oldData });

        const updatedContent = oldData.data.content.map(
          (schedule: ScheduleEntity) => {
            if (schedule.id !== scheduleId) return schedule;

            const existingIds = schedule.restaurants.map(r => r.id);

            const newRestaurants =
              restaurantIds
                ?.filter(id => !existingIds.includes(id))
                .map(
                  id =>
                    ({
                      id,
                    } as RestaurantEntity)
                ) ?? [];

            return {
              ...schedule,
              restaurants: [...schedule.restaurants, ...newRestaurants],
            };
          }
        );

        queryClient.setQueryData(queryKey, {
          ...oldData,
          data: {
            ...oldData.data,
            content: updatedContent,
          },
        });
      });

      return { previousDatas };
    },

    onError: (_err, _vars, context) => {
      context?.previousDatas.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

/* ======================
   UNASSIGN RESTAURANT FROM SCHEDULE
====================== */
export const useUnassignRestaurantFromSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      restaurantId,
    }: {
      scheduleId: number;
      restaurantId: number;
    }) => unassignRestaurantFromSchedule(scheduleId, restaurantId),

    onMutate: async ({ scheduleId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });

      const queries = queryClient.getQueriesData({ queryKey: ['schedules'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (!oldData?.data?.content) return;

        previousDatas.push({ queryKey, oldData });

        const updatedContent = oldData.data.content.map(
          (schedule: ScheduleEntity) =>
            schedule.id === scheduleId
              ? {
                  ...schedule,
                  restaurants: schedule.restaurants.filter(
                    r => r.id !== restaurantId
                  ),
                }
              : schedule
        );

        queryClient.setQueryData(queryKey, {
          ...oldData,
          data: {
            ...oldData.data,
            content: updatedContent,
          },
        });
      });

      return { previousDatas };
    },

    onError: (_err, _vars, context) => {
      context?.previousDatas.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};