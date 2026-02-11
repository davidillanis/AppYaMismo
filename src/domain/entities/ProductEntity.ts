import { DiscountEntity, OrderDetailEntity } from "./OrderEntity";
import { RestaurantEntity } from "./RestaurantEntity";

export interface ProductEntity {
  id: number;
  name: string;
  stock?: number;
  urlImage?: string;
  description?: string;
  enabled?: boolean;
  createdAt: Date;
  restaurant: RestaurantEntity;
  category: ProductCategoryEntity;
  variant: ProductVariantEntity[];
  orderDetails: OrderDetailEntity[];
  discounts: DiscountEntity[];
}

export interface ProductCreateRequestDTO {
  name: string;
  urlImage?: string;
  description: string;
  enabled: boolean;
  category: string;
  variants: VariantRequestDTO[];
  restaurantId: number;
}

export interface ProductUpdateRequestDTO {
  name: string;
  urlImage?: string;
  description: string;
  enabled: boolean;
  category: string;
}

export interface ProductCategoryEntity {
  id: number;
  name: string;
}

export interface ProductVariantEntity {
  id: number;
  price: number;
  stock: number;
  name: string;
  products: ProductEntity[];
}
export interface VariantRequestDTO {
  price: number;
  stock: number;
  name: string;
}
