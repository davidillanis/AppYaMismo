//useProductList
import { ProductCategoryEntity, ProductEntity } from '@/src/domain/entities/ProductEntity';
import { listCategoriesProducts, listProduct } from '@/src/domain/services/ProductService';
import { PageRequestDTO, PageResponse } from '@/src/domain/types/PageDTO';
import { ResponseStatusDTO } from '@/src/domain/types/ResponseStatusDTO';
import { useQuery } from '@tanstack/react-query';

export const useProductList = (params?: { fields?: string[]; restaurantId?: number } & PageRequestDTO) => {
  return useQuery<ResponseStatusDTO<PageResponse<ProductEntity[]>>>({
    queryKey: ['products', params],
    queryFn: () => listProduct(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useProductCategoryList = () => {
  return useQuery<ResponseStatusDTO<PageResponse<ProductCategoryEntity[]>>>({
    queryKey: ['product-categories'],
    queryFn: () => listCategoriesProducts(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

