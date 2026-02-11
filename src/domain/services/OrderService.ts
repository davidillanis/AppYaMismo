import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import {
  EOrderStatus,
  OrderCreateRequestDTO,
  OrderDetailEntity,
  OrderEntity,
  OrderUpdateRequestDTO,
} from "../entities/OrderEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/order";

export const updateOrder = async (
  id: number,
  payload: Partial<OrderUpdateRequestDTO>,
): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const createOrder = async (
  payload: Partial<OrderCreateRequestDTO>,
): Promise<ResponseStatusDTO<OrderCreateRequestDTO>> => {
  const url = `${BASE_PATH}/create`;
  const response = await apiClient.post<
    ResponseStatusDTO<OrderCreateRequestDTO>
  >(url, payload);
  return response.data;
};

export const confirmDelivery = async (orderId: number, pinOrQr: string): Promise<ResponseStatusDTO<string>> => {
  const url = `${BASE_PATH}/confirm-delivery/${orderId}?pinOrQr=${encodeURIComponent(pinOrQr)}`;
  const response = await apiClient.post<ResponseStatusDTO<string>>(url);
  return response.data;
};

export const listOrder = async (
  params?: {
    fields?: string[];
    customerId?: number;
    dealerId?: number;
    status?: EOrderStatus;
    restaurantId?: number;
  } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<OrderEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(",");
    }
    if (params.customerId !== undefined) {
      query.customerId = String(params.customerId);
    }
    if (params.dealerId !== undefined) {
      query.dealerId = String(params.dealerId);
    }
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
    if (params.status) query.status = params.status;
  }
  const queryString = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");
  const url = `${BASE_PATH}/list${queryString ? `?${queryString}` : ""}`;
  const response =
    await apiClient.get<ResponseStatusDTO<PageResponse<OrderEntity[]>>>(url);
  return response.data;
};

export const getOrderById = async (
  id: number,
  fields?: string[],
): Promise<ResponseStatusDTO<OrderEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(",")}`;
  }
  const response = await apiClient.get<ResponseStatusDTO<OrderEntity>>(url);
  return response.data;
};

export const deleteOrder = async (id: number): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};

export const listOrderDetails = async (
  params?: { fields?: string[]; orderId?: number } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<OrderDetailEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(",");
    }
    if (params.orderId !== undefined) {
      query.customerId = String(params.orderId);
    }
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
  }
  const queryString = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");

  const url = `${BASE_PATH}/list-details${queryString ? "?" + queryString : ""}`;
  const response =
    await apiClient.get<ResponseStatusDTO<PageResponse<OrderDetailEntity[]>>>(
      url,
    );
  return response.data;
};
export const listOrdersByDealer = async (
  dealerId: number,
  params?: {
    status?: EOrderStatus;
  } & PageRequestDTO,
): Promise<ResponseStatusDTO<PageResponse<OrderEntity[]>>> => {
  const query: Record<string, string> = {
    dealerId: String(dealerId),
  };

  if (params) {
    if (params.status) query.status = params.status;
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
  }

  const queryString = Object.keys(query)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    .join("&");

  const url = `${BASE_PATH}/list?${queryString}`;

  const response =
    await apiClient.get<ResponseStatusDTO<PageResponse<OrderEntity[]>>>(url);

  return response.data;
};
