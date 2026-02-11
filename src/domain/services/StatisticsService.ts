import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import { DealerSummaryResponseDTO } from "../entities/StatisticsEntity";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = '/statistics';

export const dealerSummary = async (dealerId: number): Promise<ResponseStatusDTO<DealerSummaryResponseDTO>> => {
    let url = `${BASE_PATH}/dealer-summary/${dealerId}`;
    const response = await apiClient.get<ResponseStatusDTO<DealerSummaryResponseDTO>>(url);
    return response.data;
};
