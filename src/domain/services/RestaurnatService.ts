import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import {
  RestaurantCreateRequestDTO,
  RestaurantEntity,
  RestaurantUpdateRequestDTO,
} from "../entities/RestaurantEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/restaurant";

export const updateRestaurant = async (
  id: number,
  payload: Partial<RestaurantUpdateRequestDTO>,
): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const createRestaurant = async (
  payload: RestaurantCreateRequestDTO,
): Promise<ResponseStatusDTO<RestaurantCreateRequestDTO>> => {
  const url = `${BASE_PATH}/create`;
  const response = await apiClient.post<
    ResponseStatusDTO<RestaurantCreateRequestDTO>
  >(url, payload);
  return response.data;
};

export const replaceSchedule = async (
  scheduleId: number,
  restaurantsId?: number[],
): Promise<ResponseStatusDTO<string>> => {
  const params = new URLSearchParams();
  params.append("scheduleId", String(scheduleId));
  restaurantsId?.forEach((id) => params.append("restaurantsId", String(id)));
  const url = `/restaurant/replace-schedule?${params.toString()}`;
  const response = await apiClient.put<ResponseStatusDTO<string>>(url);
  return response.data;
};

export const listRestaurant = async (
  params?: {
    fields?: string[];
    userId?: number;
    enabled?: boolean;
  } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<RestaurantEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(",");
    }
    if (params.userId !== undefined) {
      query.userId = String(params.userId);
    }
    if (params.enabled !== undefined) {
      query.enabled = String(params.enabled);
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
    await apiClient.get<ResponseStatusDTO<PageResponse<RestaurantEntity[]>>>(
      url,
    );
  return response.data;
};

export const getRestaurantById = async (
  id: number,
  fields?: string[],
): Promise<ResponseStatusDTO<RestaurantEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(",")}`;
  }
  const response =
    await apiClient.get<ResponseStatusDTO<RestaurantEntity>>(url);
  return response.data;
};

export const unassignResFromSchedule = async (
  scheduleId: number,
  restaurantId: number,
): Promise<ResponseStatusDTO<string>> => {
  const params = new URLSearchParams();
  params.append("scheduleId", String(scheduleId));
  params.append("restaurantId", String(restaurantId));
  const url = `/restaurant/unassign-schedule?${params.toString()}`;
  const response = await apiClient.delete<ResponseStatusDTO<string>>(url);
  return response.data;
};

export const deleteRestaurant = async (
  id: number,
): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};
