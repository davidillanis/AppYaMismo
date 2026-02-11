export enum EVehicleStatus {
  OPERATIVO = 'OPERATIVO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
}

export function valueOfEVehicleStatus(value: string): EVehicleStatus | undefined {
  const upperValue = value.toUpperCase();

  return Object.values(EVehicleStatus).includes(upperValue as EVehicleStatus)
    ? (upperValue as EVehicleStatus)
    : undefined;
}

export interface VehicleEntity {
  id: number;
  plate: string;
  createdAt: Date;
  brand: string;
  model: string;
  imagenUrl?: string;
  status: EVehicleStatus;
  assignmentSet: AssignmentEntity[];
}

export interface VehicleRequestDTO {
  plate?: string;
  brand?: string;
  model?: string;
  imagenUrl?: string;
  status?: EVehicleStatus;
}

export interface AssignmentEntity {
  id: number;
  createdAt: Date;
  active: boolean;
  vehicle: VehicleEntity;
  operator: number;
}
