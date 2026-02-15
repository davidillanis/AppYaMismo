import { ERole } from "@/src/domain/entities/UserEntity";
import { ErrorInfoType } from "@/src/domain/types/ErrorType";
import { ExternalPathString, RelativePathString } from "expo-router";

export function rolesByToken(token: string): ERole[] {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadDecoded = atob(payloadBase64);
    const payload = JSON.parse(payloadDecoded);
    let roles = payload.authorities.split(",");
    roles = roles.map((role: string) => role.replace("ROLE_", ""));
    return roles;
  } catch (error) {
    console.error("Error decoding token:", error);
    return [];
  }
}

export const getRoleRoutes = (
  token?: string,
): { role: ERole; route: RelativePathString | ExternalPathString }[] => {
  if (!token) return [];
  const roleRoutesMap: Record<ERole, string> = {
    [ERole.DEVELOPMENT]: "/(development)",
    [ERole.ADMINISTRADOR]: "/(administrator)",
    [ERole.REPARTIDOR]: "/(dealer)",
    [ERole.CLIENTE]: "/(client)",
    [ERole.RESTAURANTE]: "/(restaurant)",
  };
  return rolesByToken(token)
    .map((role) => ({ role, route: roleRoutesMap[role] as RelativePathString }))
    .filter((r) => r.route);
};

export const mappingError = (error: unknown): ErrorInfoType => {
  // 🟢 SOLUCIÓN: Si error es null o undefined, retornamos un objeto base
  if (!error) {
    return { message: "Error inesperado (sin detalles)" } as ErrorInfoType;
  }

  const axiosError = error as any;

  return {
    message: axiosError.message || "Unknown error",
    code: (axiosError as any).code,
    status: axiosError.response?.status,
    data: axiosError.response?.data,
    url: axiosError.config?.url,
    method: axiosError.config?.method,
    headers: axiosError.config?.headers as Record<string, unknown>,
    baseURL: axiosError.config?.baseURL,
  };
};
