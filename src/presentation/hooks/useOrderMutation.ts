import {
  EOrderStatus,
  OrderCreateRequestDTO,
  OrderEntity,
  OrderUpdateRequestDTO,
} from '@/src/domain/entities/OrderEntity';
import {
  createOrder,
  deleteOrder,
  updateOrder,
} from '@/src/domain/services/OrderService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/* ======================
   CREATE ORDER
====================== */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: Partial<OrderCreateRequestDTO> }) =>
      createOrder(payload),

    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      const queries = queryClient.getQueriesData({ queryKey: ['orders'] });
      const previousDatas: any[] = [];

      const tempOrder: OrderEntity = {
        id: Date.now(),

        orderStatus: EOrderStatus.PENDIENTE,

        subtotal: 0,
        discountedAmount: 0,
        totalIgv: 0,
        total: 0,

        latitude: payload.latitude ?? 0,
        longitude: payload.longitude ?? 0,

        createdAt: new Date(),
        closingDate: new Date(),

        version: 0,

        customer: {
          id: payload.customerId ?? 0,
        } as any,

        dealer: {} as any,
        sale: {} as any,

        orderDetails: payload.orderDetails
          ? payload.orderDetails.map((d, index) => ({
            id: -index - 1,
            amount: d.amount,
            unitPrice: d.unitPrice,
            subTotal: d.amount * d.unitPrice,
            note: d.note ?? '',
            createdAt: new Date().toISOString(),
            order: {} as any,
            product: {
              id: d.productId,
            } as any,
          }))
          : [],
      };

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: [tempOrder, ...oldData.data.content],
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/* ======================
   UPDATE ORDER
====================== */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<OrderUpdateRequestDTO>;
    }) => updateOrder(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      const queries = queryClient.getQueriesData({ queryKey: ['orders'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (!oldData?.data?.content) return;

        previousDatas.push({ queryKey, oldData });

        queryClient.setQueryData(queryKey, {
          ...oldData,
          data: {
            ...oldData.data,
            content: oldData.data.content.map((order: OrderEntity) =>
              order.id === id
                ? {
                  ...order,
                  ...(payload.orderStatus && {
                    orderStatus: payload.orderStatus,
                  }),
                  ...(payload.latitude !== undefined && {
                    latitude: payload.latitude,
                  }),
                  ...(payload.longitude !== undefined && {
                    longitude: payload.longitude,
                  }),
                }
                : order
            ),
          },
        });
      });

      return { previousDatas };
    },

    onError: (_error, _variables, context) => {
      context?.previousDatas?.forEach(({ queryKey, oldData }: any) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/* ======================
   DELETE ORDER
====================== */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOrder(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      const queries = queryClient.getQueriesData({ queryKey: ['orders'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: oldData.data.content.filter(
                (order: OrderEntity) => order.id !== id
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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

