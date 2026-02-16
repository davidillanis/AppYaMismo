import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/chat";

export const chatAsk = async (message: string, sessionId: string): Promise<ResponseStatusDTO<string>> => {
    const url = `${BASE_PATH}/ask`;
    const response = await apiClient.get<ResponseStatusDTO<string>>(url, { params: { message, sessionId } });
    return response.data;
};
