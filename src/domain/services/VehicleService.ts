import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import { OperatorEntity } from "../entities/UserEntity";
import { VehicleEntity, VehicleRequestDTO } from "../entities/VehicleEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = '/vehicle';

export const createVehicle = async (payload: Partial<VehicleRequestDTO>, idOperator:number| null): Promise<ResponseStatusDTO<VehicleRequestDTO>> => {
  let url = `${BASE_PATH}/create${idOperator ? `?operatorId=${idOperator}` : ""}`;
  
  const response = await apiClient.post<ResponseStatusDTO<VehicleRequestDTO>>(url, payload);
  return response.data;
};

export const listVehicle = async (params?: { fields?: string[] } & PageRequestDTO): Promise<ResponseStatusDTO<PageResponse<VehicleEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(',');
    }
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
  }
  const queryString = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join('&');

  const url = `${BASE_PATH}/list${queryString ? '?' + queryString : ''}`;
  const response = await apiClient.get<ResponseStatusDTO<PageResponse<VehicleEntity[]>>>(url);
  return response.data;
};

export const getVehicleById = async (id: number, fields?: string[]): Promise<ResponseStatusDTO<VehicleEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(',')}`;
  }
  const response = await apiClient.get<ResponseStatusDTO<VehicleEntity>>(url);
  return response.data;
};

export const findActiveOperator = async (vehicleId:number): Promise<ResponseStatusDTO<OperatorEntity>> => {
  let url = `${BASE_PATH}/by-operator/${vehicleId}`;
  const response = await apiClient.get<ResponseStatusDTO<OperatorEntity>>(url);
  return response.data;
};

export const updateVehicle = async (id: number, payload: Partial<VehicleRequestDTO>): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const assignOperatorToVehicle = async (vehicleId: number, operatorId: number): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/assign-operator?vehicleId=${vehicleId}&operatorId=${operatorId}`;
  const response = await apiClient.post<ResponseStatusDTO<number>>(url, {});
  return response.data;
};

export const deleteVehicle = async (id: number): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};
