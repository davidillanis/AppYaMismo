import {
  RestaurantCreateRequestDTO,
  RestaurantEntity,
  RestaurantUpdateRequestDTO,
} from '@/src/domain/entities/RestaurantEntity';
import {
  createRestaurant,
  deleteRestaurant,
  replaceSchedule,
  unassignResFromSchedule,
  updateRestaurant,
} from '@/src/domain/services/RestaurnatService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/* ======================
   CREATE RESTAURANT
====================== */
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: RestaurantCreateRequestDTO }) =>
      createRestaurant(payload),

    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: ['restaurants'] });

      const queries = queryClient.getQueriesData({ queryKey: ['restaurants'] });
      const previousDatas: any[] = [];

      const tempRestaurant: RestaurantEntity = {
        id: 0,
        name: payload.name ?? '',
        address: payload.address ?? '',
        urlImagen: payload.urlImagen ?? '',
        enabled: true,
        latitude: payload.latitude ?? 0,
        longitude: payload.longitude ?? 0,
        createdAt: new Date().toISOString(),

        restaurantTypes: payload.type
          ? payload.type.map((t, index) => ({
            id: -index - 1,
            name: t,
          }))
          : [],

        schedules: [],
        products: [],
        userEntity: {
          id: payload.userId,
        } as any
      };

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: [tempRestaurant, ...oldData.data.content],
              totalElements: oldData.data.totalElements + 1,
            },
          });
        }
      });

      return { previousDatas };
    },

    onError: (_err, _variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

/* ======================
   UPDATE RESTAURANT
====================== */
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<RestaurantUpdateRequestDTO>;
    }) => updateRestaurant(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['restaurants'] });

      const queries = queryClient.getQueriesData({ queryKey: ['restaurants'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          const updatedContent = oldData.data.content.map(
            (restaurant: RestaurantEntity) =>
              restaurant.id === id
                ? {
                  ...restaurant,
                  name: payload.name ?? restaurant.name,
                  address: payload.address ?? restaurant.address,
                  urlImagen: payload.urlImagen ?? restaurant.urlImagen,
                  enabled:
                    payload.enabled !== undefined
                      ? payload.enabled
                      : restaurant.enabled,
                }
                : restaurant
          );

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: updatedContent,
            },
          });
        }
      });

      return { previousDatas };
    },

    onError: (_err, _variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

/* ======================
   DELETE RESTAURANT
====================== */
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRestaurant(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['restaurants'] });

      const queries = queryClient.getQueriesData({ queryKey: ['restaurants'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: oldData.data.content.filter(
                (restaurant: RestaurantEntity) => restaurant.id !== id
              ),
              totalElements: oldData.data.totalElements - 1,
            },
          });
        }
      });

      return { previousDatas };
    },

    onError: (_err, _variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
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
    }) => unassignResFromSchedule(scheduleId, restaurantId),

    onMutate: async ({ scheduleId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['restaurants'] });

      const queries = queryClient.getQueriesData({ queryKey: ['restaurants'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          const updatedContent = oldData.data.content.map(
            (restaurant: RestaurantEntity) =>
              restaurant.id === restaurantId
                ? {
                  ...restaurant,
                  schedules: restaurant.schedules.filter(
                    (schedule) => schedule.id !== scheduleId
                  ),
                }
                : restaurant
          );

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: updatedContent,
            },
          });
        }
      });

      return { previousDatas };
    },

    onError: (_err, _vars, context) => {
      context?.previousDatas.forEach(
        ({ queryKey, oldData }: any) => {
          queryClient.setQueryData(queryKey, oldData);
        }
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

/* ======================
   REPLACE SCHEDULE (BULK)
====================== */
export const useReplaceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scheduleId,
      restaurantsId,
    }: {
      scheduleId: number;
      restaurantsId?: number[];
    }) => replaceSchedule(scheduleId, restaurantsId),

    onMutate: async ({ scheduleId, restaurantsId }) => {
      await queryClient.cancelQueries({ queryKey: ['restaurants'] });

      const queries = queryClient.getQueriesData({ queryKey: ['restaurants'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (!oldData?.data?.content) return;

        previousDatas.push({ queryKey, oldData });

        const updatedContent = oldData.data.content.map(
          (restaurant: RestaurantEntity) => {
            // 🔹 Restaurantes NO seleccionados → remover schedule
            if (!restaurantsId?.includes(restaurant.id)) {
              return {
                ...restaurant,
                schedules: restaurant.schedules.filter(
                  (s) => s.id !== scheduleId
                ),
              };
            }

            // 🔹 Restaurantes seleccionados → agregar schedule si no existe
            const exists = restaurant.schedules.some(
              (s) => s.id === scheduleId
            );

            if (exists) return restaurant;

            return {
              ...restaurant,
              schedules: [
                ...restaurant.schedules,
                { id: scheduleId } as any,
              ],
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
      context?.previousDatas.forEach(
        ({ queryKey, oldData }: any) => {
          queryClient.setQueryData(queryKey, oldData);
        }
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};