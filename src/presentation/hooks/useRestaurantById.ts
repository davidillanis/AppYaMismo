import { RestaurantEntity } from "@/src/domain/entities/RestaurantEntity";
import { getRestaurantById } from "@/src/domain/services/RestaurnatService";
// 1. Importamos UseQueryResult para definir el tipo de retorno explícitamente
import { useQuery, UseQueryResult } from "@tanstack/react-query";

// 2. Definimos que la función retorna : UseQueryResult<RestaurantEntity, Error>
export const useRestaurantById = (
  id: number,
): UseQueryResult<RestaurantEntity, Error> => {
  return useQuery<RestaurantEntity, Error>({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      // TypeScript cree que retorna ResponseStatusDTO, pero tus logs confirmaron que es la entidad plana.
      const response = await getRestaurantById(id);

      // Hacemos el cast para que coincida con la realidad de tus datos
      return response.data as unknown as RestaurantEntity;
    },
    // Solo se ejecuta si el ID es válido
    enabled: !!id && !isNaN(id) && id > 0,
    staleTime: 0,
  });
};
