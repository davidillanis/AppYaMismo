import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import { ScheduleEntity, ScheduleRequestDTO } from "../entities/SheduleEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/schedule";

export const createSchedule = async (
  payload: Partial<ScheduleRequestDTO>,
): Promise<ResponseStatusDTO<ScheduleRequestDTO>> => {
  const url = `${BASE_PATH}/create`;
  const response = await apiClient.post<ResponseStatusDTO<ScheduleRequestDTO>>(
    url,
    payload,
  );
  return response.data;
};

export const updateSchedule = async (
  id: number,
  payload: Partial<ScheduleRequestDTO>,
): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const listSchedule = async (
  params?: { fields?: string[] } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<ScheduleEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(",");
    }
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
  }
  const queryString = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");

  const url = `${BASE_PATH}/list${queryString ? "?" + queryString : ""}`;
  const response =
    await apiClient.get<ResponseStatusDTO<PageResponse<ScheduleEntity[]>>>(url);
  return response.data;
};

export const getScheduleById = async (
  id: number,
  fields?: string[],
): Promise<ResponseStatusDTO<ScheduleEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(",")}`;
  }
  const response = await apiClient.get<ResponseStatusDTO<ScheduleEntity>>(url);
  return response.data;
};

export const deleteSchedule = async (
  id: number,
): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};

export const assignSchedule = async (
  scheduleId: number,
  restaurantId?: number[],
): Promise<ResponseStatusDTO<string>> => {
  const params = new URLSearchParams();
  params.append("scheduleId", String(scheduleId));
  restaurantId?.forEach((id) => params.append("restaurantId", String(id)));
  const url = `${BASE_PATH}/replace-restaurant?${params.toString()}`;
  const response = await apiClient.put<ResponseStatusDTO<string>>(url);
  return response.data;
};

export const unassignRestaurantFromSchedule = async (
  scheduleId: number,
  restaurantId?: number,
): Promise<ResponseStatusDTO<string>> => {
  const params = new URLSearchParams();
  params.append("scheduleId", String(scheduleId));
  params.append("restaurantId", String(restaurantId));
  const url = `${BASE_PATH}/unassign-restaurant?${params.toString()}`;
  const response = await apiClient.delete<ResponseStatusDTO<string>>(url);
  return response.data;
};
