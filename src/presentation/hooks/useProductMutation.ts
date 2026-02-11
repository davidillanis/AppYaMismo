import {
  ProductCreateRequestDTO,
  ProductEntity,
  ProductUpdateRequestDTO,
} from '@/src/domain/entities/ProductEntity';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/src/domain/services/ProductService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/* ======================
   CREATE PRODUCT
====================== */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreateRequestDTO) =>
      createProduct(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previous = queryClient.getQueriesData({
        queryKey: ["products"],
      });

      const tempProduct: ProductEntity = {
        id: Date.now(),
        name: payload.name,
        urlImage: payload.urlImage,
        description: payload.description,
        enabled: payload.enabled,
        createdAt: new Date(),

        restaurant: { id: payload.restaurantId } as any,
        category: { id: 0, name: payload.category },

        variant: payload.variants.map((v, index) => ({
          id: index,
          name: v.name,
          price: v.price,
          stock: v.stock,
          products: [],
        })),

        orderDetails: [],
        discounts: [],
      };

      previous.forEach(([key, oldData]: any) => {
        if (!oldData?.data?.content) return;

        queryClient.setQueryData(key, {
          ...oldData,
          data: {
            ...oldData.data,
            content: [tempProduct, ...oldData.data.content],
            totalElements: oldData.data.totalElements + 1,
          },
        });
      });

      return { previous };
    },

    onError: (_err, _payload, context) => {
      context?.previous.forEach(([key, oldData]: any) => {
        queryClient.setQueryData(key, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ======================
   UPDATE PRODUCT
====================== */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductUpdateRequestDTO>;
    }) => updateProduct(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previous = queryClient.getQueriesData({
        queryKey: ["products"],
      });

      previous.forEach(([key, oldData]: any) => {
        if (!oldData?.data?.content) return;

        queryClient.setQueryData(key, {
          ...oldData,
          data: {
            ...oldData.data,
            content: oldData.data.content.map((product: ProductEntity) =>
              product.id === id
                ? {
                  ...product,
                  ...payload,

                  // category viene como string
                  category: payload.category
                    ? { ...product.category, name: payload.category }
                    : product.category,
                }
                : product
            ),
          },
        });
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, oldData]: any) => {
        queryClient.setQueryData(key, oldData);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/* ======================
   DELETE PRODUCT
====================== */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });

      const queries = queryClient.getQueriesData({ queryKey: ['products'] });
      const previousDatas: any[] = [];

      queries.forEach(([queryKey, oldData]: any) => {
        if (oldData?.data?.content) {
          previousDatas.push({ queryKey, oldData });

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              content: oldData.data.content.filter(
                (product: ProductEntity) => product.id !== id
              ),
              totalElements: Math.max(0, (oldData.data.totalElements || 0) - 1),
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};