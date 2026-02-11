import { RestaurantEntity } from "./RestaurantEntity";

export interface ScheduleEntity {
  id: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  days: DayEntity[];
  restaurants: RestaurantEntity[];
}

export interface ScheduleRequestDTO {
  startTime: Date;
  endTime: Date;
  day: EWeekDay[];
}

export enum EWeekDay {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export interface DayEntity {
  id: number;
  name: string;
}


