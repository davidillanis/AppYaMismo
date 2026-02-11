//ProductService.ts
import { apiClient } from "@/src/infrastructure/configuration/http/apiClient";
import {
  ProductCategoryEntity,
  ProductCreateRequestDTO,
  ProductEntity,
  ProductUpdateRequestDTO,
  VariantRequestDTO,
} from "../entities/ProductEntity";
import { PageRequestDTO, PageResponse } from "../types/PageDTO";
import { ResponseStatusDTO } from "../types/ResponseStatusDTO";

const BASE_PATH = "/product";

export const updateProduct = async (id: number, payload: Partial<ProductUpdateRequestDTO>): Promise<ResponseStatusDTO<number>> => {
  const url = `${BASE_PATH}/update?id=${id}`;
  const response = await apiClient.put<ResponseStatusDTO<number>>(url, payload);
  return response.data;
};

export const createProduct = async (payload: ProductCreateRequestDTO): Promise<ResponseStatusDTO<ProductCreateRequestDTO>> => {
  const url = `${BASE_PATH}/create`;
  const response = await apiClient.post<ResponseStatusDTO<ProductCreateRequestDTO>>(url, payload);
  return response.data;
};

export const replaceVariants = async (productId: number, variants: VariantRequestDTO[]): Promise<ResponseStatusDTO<string>> => {
  const url = `${BASE_PATH}/replace-variants?productId=${productId}`;
  const response = await apiClient.put<ResponseStatusDTO<string>>(url, variants);
  return response.data;
};

export const listProduct = async (params?: { fields?: string[]; restaurantId?: number } & PageRequestDTO): Promise<ResponseStatusDTO<PageResponse<ProductEntity[]>>> => {
  const query: Record<string, string> = {};
  if (params) {
    if (params.fields && params.fields.length > 0) {
      query.fields = params.fields.join(",");
    }
    if (params.restaurantId !== undefined) {
      query.restaurantId = String(params.restaurantId);
    }
    if (params.page !== undefined) query.page = String(params.page);
    if (params.size !== undefined) query.size = String(params.size);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.direction) query.direction = params.direction;
  }
  const queryString = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const url = `${BASE_PATH}/list${queryString ? "?" + queryString : ""}`;
  const response = await apiClient.get<ResponseStatusDTO<PageResponse<ProductEntity[]>>>(url);
  return response.data;
};

export const listCategoriesProducts = async (): Promise<ResponseStatusDTO<PageResponse<ProductCategoryEntity[]>>> => {
  const url = `${BASE_PATH}/list-category`;
  const response =
    await apiClient.get<
      ResponseStatusDTO<PageResponse<ProductCategoryEntity[]>>
    >(url);
  return response.data;
};

export const getProductById = async (id: number, fields?: string[]): Promise<ResponseStatusDTO<ProductEntity>> => {
  let url = `${BASE_PATH}/byId/${id}`;
  if (fields && fields.length > 0) {
    url += `?fields=${fields.join(",")}`;
  }
  const response = await apiClient.get<ResponseStatusDTO<ProductEntity>>(url);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<ResponseStatusDTO> => {
  const url = `${BASE_PATH}/delete/${id}`;
  const response = await apiClient.delete<ResponseStatusDTO>(url);
  return response.data;
};