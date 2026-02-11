import { OperatorEntity } from "@/src/domain/entities/UserEntity";
import { listOperators } from "@/src/domain/services/UserService";
import { PageRequestDTO, PageResponse } from "@/src/domain/types/PageDTO";
import { ResponseStatusDTO } from "@/src/domain/types/ResponseStatusDTO";
import { useQuery } from "@tanstack/react-query";

export const useOperatorList = (
  params?: { fields?: string[] } & PageRequestDTO,
) => {
  return useQuery<ResponseStatusDTO<PageResponse<OperatorEntity[]>>>({
    queryKey: ["operators", params],
    queryFn: async () => {
      console.log("📡 SOLICITANDO OPERADORES (listOperators)...");
      try {
        const response = await listOperators(params);
        console.log(
          "📦 RESPUESTA API (RAW):",
          JSON.stringify(response, null, 2),
        );
        return response;
      } catch (error) {
        console.error("❌ ERROR API OPERATORS:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
