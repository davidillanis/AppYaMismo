import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import {
  OperatorEntity,
  UserCreateGeneralRequestDTO,
  UserCreateRequestDTO,
  UserEntity,
  UserUpdateRequestDTO,
} from "../entities/UserEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/user-role";

export const createUser = async (
  payload: Partial<UserCreateGeneralRequestDTO>,
): Promise<ResponseStatusDTO<UserEntity>> => {
  let url = `${BASE_PATH}/create`;
  console.log(payload);

  const response = await apiClient.post<ResponseStatusDTO<UserEntity>>(
    url,
    payload,
  );
  return response.data;
};
export const registerCustomer = async (
  payload: Partial<UserCreateRequestDTO>,
): Promise<ResponseStatusDTO<UserEntity>> => {
  let url = `${BASE_PATH}/create-customer`;
  const response = await apiClient.post<ResponseStatusDTO<UserEntity>>(
    url,
    payload,
  );
  return response.data;
};
export const listUsers = async (
  params?: { fields?: string[] } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<UserEntity[]>>> => {
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
    await apiClient.get<Promise<ResponseStatusDTO<PageResponse<UserEntity[]>>>>(
      url,
    );
  return response.data;
};

export const listOperators = async (
  params?: { fields?: string[] } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<OperatorEntity[]>>> => {
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

  const url = `${BASE_PATH}/list-operator${queryString ? "?" + queryString : ""}`;
  const response =
    await apiClient.get<
      Promise<ResponseStatusDTO<PageResponse<OperatorEntity[]>>>
    >(url);
  return response.data;
};

export const getUserById = async (
  id: number,
  fields?: string[],
): Promise<ResponseStatusDTO<UserEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(",")}`;
  }
  const response = await apiClient.get<ResponseStatusDTO<UserEntity>>(url);
  return response.data;
};

export const updateUser = async (
  id: number,
  payload: Partial<UserUpdateRequestDTO>,
): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};
