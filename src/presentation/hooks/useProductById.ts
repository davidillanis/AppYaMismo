import { ProductEntity } from "@/src/domain/entities/ProductEntity";
import { getProductById } from "@/src/domain/services/ProductService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useProductById = (id: number): UseQueryResult<ProductEntity | null, Error> => {
  return useQuery<ProductEntity | null, Error>({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await getProductById(id);

      // Aseguramos que nunca retorne undefined
      if (!response || !response.data) {
        console.warn("⚠️ Producto no encontrado o sin datos en la API");
        return null; // <- ✅ React Query acepta null sin error
      }

      return response.data as ProductEntity;
    },
    enabled: !!id && !isNaN(id) && id > 0,
    staleTime: 0,
  });
};


