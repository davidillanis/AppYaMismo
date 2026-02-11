import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  ERole,
  OperatorRequestDTO,
  UserCreateGeneralRequestDTO,
  UserCreateRequestDTO,
  UserUpdateRequestDTO,
} from "@/src/domain/entities/UserEntity";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/src/domain/services/UserService";
import { ResponseStatusDTO } from "@/src/domain/types/ResponseStatusDTO";

type UpdatePayload = {
  id: number;
  data: UserUpdateRequestDTO;
};

// Definimos un tipo para la UI que sigue usando "operatorDTO" internamente por comodidad del form,
// pero lo mapearemos antes de enviar.
type CreatePayload = {
  role: ERole;
  userDTO: UserCreateRequestDTO;
  operatorDTO?: OperatorRequestDTO;
};

export const useUserMutation = () => {
  const qc = useQueryClient();

  // 1. CREATE (CORREGIDO Y UNIFICADO)
  const createMutation = useMutation<
    ResponseStatusDTO<any>,
    any,
    CreatePayload
  >({
    mutationFn: async ({ role, userDTO, operatorDTO }) => {
      console.log(`🚀 Creando usuario rol: ${role}`);

      // Construimos el payload que coincide con tu Swagger y tu UserEntity actualizado
      const payload: Partial<UserCreateGeneralRequestDTO> = {
        userDTO: userDTO,
        dealerDTO: undefined, // Clave correcta según tu Swagger
        customerDTO: undefined, // Clave correcta según tu Swagger
      };

      // LOGICA DE MAPEO:
      if (role === ERole.REPARTIDOR) {
        // Aquí está la corrección del error: Asignamos a 'dealerDTO'
        payload.dealerDTO = operatorDTO;
      } else if (role === ERole.CLIENTE) {
        // Agregamos datos dummy requeridos para clientes
        payload.customerDTO = {
          type: "REGULAR",
          latitude: 0,
          longitude: 0,
        };
      }

      console.log("📦 Payload a enviar:", JSON.stringify(payload));

      // Usamos siempre createUser, ya que registerCustomer no existía (Error 404)
      return await createUser(payload);
    },
    onSuccess: (res) => {
      if (res?.data || res?.isSuccess) {
        Toast.show({
          type: "success",
          text1: "Usuario creado",
          text2: "Registro exitoso en el sistema.",
        });
        qc.invalidateQueries({ queryKey: ["user-list"] });
      } else {
        const errorMsg = res?.errors?.[0] ?? "Error desconocido al crear";
        throw new Error(errorMsg);
      }
    },
    onError: (err: any) => {
      console.error("❌ Error API:", err);
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        (Array.isArray(err.response?.data) ? err.response?.data[0] : null) ||
        err.message ||
        "Error de conexión";

      Toast.show({
        type: "error",
        text1: "Falló la creación",
        text2: backendMsg,
      });
    },
  });

  // 2. UPDATE (EXISTENTE)
  const updateMutation = useMutation<
    ResponseStatusDTO<any>,
    any,
    UpdatePayload
  >({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (res, vars) => {
      if (res?.data !== undefined || res?.isSuccess) {
        Toast.show({
          type: "success",
          text1: "Perfil actualizado",
        });
        qc.invalidateQueries({ queryKey: ["user-list"] });
        qc.invalidateQueries({ queryKey: ["user-by-id", vars.id] });
      } else {
        Toast.show({
          type: "error",
          text1: "No se pudo actualizar",
          text2: res?.errors?.[0] ?? "Error desconocido",
        });
      }
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (err as any)?.message ?? "Error actualizando",
      });
    },
  });

  // 3. DELETE (EXISTENTE)
  const deleteMutation = useMutation<ResponseStatusDTO<any>, any, number>({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (res) => {
      if (res?.data !== undefined || res?.isSuccess) {
        Toast.show({
          type: "success",
          text1: "Usuario eliminado",
        });
        qc.invalidateQueries({ queryKey: ["user-list"] });
      } else {
        Toast.show({
          type: "error",
          text1: "Error al eliminar",
          text2: res?.errors?.[0] ?? "Error desconocido",
        });
      }
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (err as any)?.message ?? "Error eliminando",
      });
    },
  });

  return {
    createUser: createMutation.mutate,
    createUserAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateUser: updateMutation.mutate,
    updateUserAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteUser: deleteMutation.mutate,
    deleteUserAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
