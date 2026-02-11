import { OrderEntity } from "./OrderEntity";
import { AssignmentEntity } from "./VehicleEntity";

// types.ts
export enum ERole {
  DEVELOPMENT = "DEVELOPMENT",
  ADMINISTRADOR = "ADMINISTRADOR",
  REPARTIDOR = "REPARTIDOR",
  CLIENTE = "CLIENTE",
  RESTAURANTE = "RESTAURANTE",
}

export enum ETypeCustomer {
  REGULAR = "REGULAR",
  VIP = "VIP",
  CORPORATIVO = "CORPORATIVO",
  ESTRATEGICO = "ESTRATEGICO",
}

export function valueOfERole(value: string): ERole | undefined {
  const upperValue = value.toUpperCase();

  return Object.values(ERole).includes(upperValue as ERole)
    ? (upperValue as ERole)
    : undefined;
}

export interface UserEntity {
  id?: number;
  name?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
  registrationDate?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  email?: string;
  password?: string;
  roles?: ERole[];
}

export interface OperatorEntity {
  id: number;
  license: string;
  salary: number;
  creationDate: Date;
  userEntity: UserEntity;
  assignmentSet: AssignmentEntity[];
}

// Mantenemos el nombre 'OperatorRequestDTO' para la estructura interna
// aunque en el envío final lo asignaremos a la clave 'dealerDTO'
export interface OperatorRequestDTO {
  license: string;
  salary: number;
}

export interface UserCreateRequestDTO {
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  address: string;
  imageUrl: string;
  email: string;
  password: string;
  roles: ERole[];
}

export interface UserUpdateRequestDTO {
  name?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
  enabled?: boolean;
}

// ✅ NUEVO: DTO para crear Clientes (Requerido por tu Backend)
export interface CustomerRequestDTO {
  type: string;
  latitude: number;
  longitude: number;
}

// ✅ ACTUALIZADO: Estructura General corregida según Swagger
export interface UserCreateGeneralRequestDTO {
  userDTO: UserCreateRequestDTO;
  dealerDTO?: OperatorRequestDTO; // Antes 'operatorDTO' -> Ahora coincide con el Backend
  customerDTO?: CustomerRequestDTO; // Nuevo campo para clientes
}

export interface CustomerEntity {
  id: number;
  type: ETypeCustomer;
  latitude: number;
  longitude: number;
  userEntity: UserEntity;
  orders: OrderEntity[];
}

export interface DealerEntity {
  id: number;
  name: string;
}

export interface DealerUserInfoDTO {
  operatorId: number;
  userId: number;
  email: string;
  name: string;
  lastName: string;
  dni: string;
}
