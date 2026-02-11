import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import { LoginResponseDTO } from "../entities/AuthEntity";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = '/auth';

export const loginUser = async (payload: { email: string; password: string }): Promise<ResponseStatusDTO<LoginResponseDTO>> => {
  let url = `${BASE_PATH}/login`;
  const response = await apiClient.post<ResponseStatusDTO<LoginResponseDTO>>(url, payload);
  return response.data;
};

export const validateToken = async (token: string): Promise<ResponseStatusDTO<boolean>> => {
  let url = `${BASE_PATH}/validateToken/${token}`;
  const response = await apiClient.get<ResponseStatusDTO<boolean>>(url);
  return response.data;
};

export const resetPassword = async (payload: { token: string; newPassword: string, email: string }): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/reset-password`;
  const response = await apiClient.post<ResponseStatusDTO>(url, payload);
  return response.data;
};

export const forgotPassword = async (payload: { email: string }): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/forgot-password`;
  const response = await apiClient.post<ResponseStatusDTO>(url, payload);
  return response.data;
};
