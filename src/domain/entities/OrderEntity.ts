import { ProductEntity } from "./ProductEntity";
import { EPaymentMethod, SaleEntity } from "./SaleEntity";
import { CustomerEntity, DealerEntity } from "./UserEntity";

export interface OrderEntity {
  id: number;
  version: number;
  orderStatus: EOrderStatus;
  subtotal: number;
  discountedAmount: number;
  totalIgv: number;
  total: number;
  closingDate: Date;
  createdAt: Date;
  latitude: number;
  longitude: number;
  pin: string;
  qrToken: string;
  confirmationStatus: string;
  pinExpiresAt: Date;
  customer: CustomerEntity;
  dealer: DealerEntity;
  sale: SaleEntity;
  orderDetails: OrderDetailEntity[];
}

export interface OrderUpdateRequestDTO {
  orderStatus?: EOrderStatus;
  latitude?: number;
  longitude?: number;
}

export enum EOrderStatus {
  PENDIENTE = "PENDIENTE",
  EN_CAMINO = "EN_CAMINO",
  CANCELADO = "CANCELADO",
  RECHAZADO = "RECHAZADO",
  ENTREGADO = "ENTREGADO"
}

export enum EDiscountType {
  PERCENTAGE = "PERCENTAGE",
  AMOUNT = "AMOUNT"
}


export interface DiscountRequestDTO {
  description: string;
  discount: number;
  type: EDiscountType;
  startDate: Date;
  endDate: Date;
  state: boolean;
  productId: number;
}

export interface DiscountEntity {
  id?: number;
  description: string;
  discount: number;
  type: EDiscountType;
  startDate: string;
  endDate: string;
  state?: boolean;
  createdAt: string;
  product: ProductEntity;
}

export interface DiscountSummaryDTO {
  discount: number;
  type: EDiscountType;
}


export interface OrderDetailEntity {
  id?: number;
  amount: number;
  unitPrice: number;
  subTotal: number;
  note: string;
  createdAt: string;
  order: OrderEntity;
  product: ProductEntity;
}

export interface OrderDetailRequestDTO {
  amount: number;
  unitPrice: number;
  note?: string;
  productId: number;
  variantId: number;
}

export interface OrderCreateRequestDTO {
  paymentMethod: EPaymentMethod;
  latitude: number;
  longitude: number;
  customerId: number;
  orderDetails: OrderDetailRequestDTO[];
}