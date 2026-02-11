import { ProductEntity } from "./ProductEntity";
import { ScheduleEntity } from "./SheduleEntity";
import { UserEntity } from "./UserEntity";

export interface RestaurantEntity {
  id: number;
  name: string;
  address: string;
  urlImagen: string;
  enabled: boolean;
  latitude: number;
  longitude: number;
  createdAt: string;

  userEntity: UserEntity;
  restaurantTypes: RestaurantTypeEntity[];
  schedules: ScheduleEntity[];
  products: ProductEntity[];
}

export interface RestaurantTypeEntity {
  id: number;
  name: string;
}

export interface RestaurantUpdateRequestDTO {
  name: string;
  address: string;
  urlImagen: string;
  enabled: boolean;
  latitude: number;
  longitude: number;
  type: string[];
}

export interface RestaurantCreateRequestDTO {
  name: string;
  address: string;
  urlImagen: string;
  enabled: boolean;
  latitude: number;
  longitude: number;
  userId: number;
  type: string[];
}
