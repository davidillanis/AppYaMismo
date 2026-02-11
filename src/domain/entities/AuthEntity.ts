import { UserEntity } from "./UserEntity";

export type ISODateString = string;

export interface TokenEntity {
  id?: number;
  token: string;
  userEntity: UserEntity;
  expiryDate: ISODateString;
}

export interface PasswordResetEntity {
  id?: string;
  token: string;
  user: UserEntity;
  createdAt: ISODateString;
  expiresAt: ISODateString;
  usedAt?: ISODateString | null;
}

export type LoginResponseDTO = {
  id: number;
  dealerId: number | null;
  customerId: number | null;
  restaurantId: number | null;
  email: string;
  name: string;
  lastName: string;
  imageUrl: string | null;
  accessToken: string;
};