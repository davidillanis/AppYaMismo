import { LoginResponseDTO } from "@/src/domain/entities/AuthEntity";
import { ERole, UserCreateRequestDTO } from "@/src/domain/entities/UserEntity";
import {
  loginUser,
  validateToken,
} from "@/src/domain/services/AuthService";
import { registerCustomer } from "@/src/domain/services/UserService";
import { setAuthToken } from "@/src/infrastructure/configuration/http/apiClient";
import {
  mappingError,
  rolesByToken
} from "@/src/infrastructure/configuration/security/DecodeToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useCallback, useContext, useState } from "react";
import Toast from "react-native-toast-message";

export type SignInResult = { success: boolean; error?: string };

type AuthContextType = {
  signIn: (payload: { email: string; password: string }) => Promise<SignInResult>;
  signUp: (user: UserCreateRequestDTO) => Promise<void>;
  isLoading: boolean;
  user: LoginResponseDTO | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => ({ success: false }),
  signUp: async () => { },
  isLoading: false,
  user: null,
  logout: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<LoginResponseDTO | null>(null);
  const router = useRouter();

  const redirectByRole = useCallback(
    (token: string) => {
      const role = rolesByToken(token)?.[0];
      switch (role) {
        case ERole.DEVELOPMENT:
          router.replace("/(development)");
          break;
        case ERole.ADMINISTRADOR:
          router.replace("/(administrator)");
          break;
        case ERole.REPARTIDOR:
          router.replace("/(dealer)");
          break;
        case ERole.CLIENTE:
          router.replace("/(client)");
          break;
        case ERole.RESTAURANTE:
            router.replace("/(restaurant)");
            break;
        default:
          router.replace("/login");
          break;
      }
    },
    [router],
  );

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<SignInResult> => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });

      if (res.isSuccess) {
        let loginResponse = res.data as LoginResponseDTO;

        setUser(loginResponse);
        await AsyncStorage.setItem("accessToken", loginResponse.accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(loginResponse));
        setAuthToken(loginResponse.accessToken);

        Toast.show({
          type: "success",
          text1: "Bienvenido",
          text2: "Inicio de sesión exitoso",
        });
        redirectByRole(loginResponse.accessToken);
        return { success: true };
      } else {
        const errorMsg = res.errors?.[0] || "Credenciales incorrectas";
        Toast.show({
          type: "error",
          text1: "Error de autenticación",
          text2: errorMsg,
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.log((error as any).response?.data);
      Toast.show({
        type: "error",
        text1: "Error de autenticación",
        text2: "Credenciales incorrectas",
      });
      return { success: false, error: "Credenciales incorrectas" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (viewToast: boolean = true) => {
    setUser(null);
    setAuthToken(undefined);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("user");
    if (viewToast) {
      Toast.show({
        type: "success",
        text1: "Cerrar Sesión",
        text2: "Sesión cerrada correctamente",
      });
    }
  };

  const signUp = async (user: UserCreateRequestDTO) => {
    setIsLoading(true);
    try {
      user.roles = [ERole.CLIENTE];
      const rest = await registerCustomer(user);

      if (rest.isSuccess) {
        Toast.show({
          type: "success",
          text1: "Usuario creado",
          text2: "Revisa tu correo para verificar",
        });
        router.replace("/login");
        return;
      }
      throw new Error("error: " + JSON.stringify(rest.errors));
    } catch (err) {
      let error = mappingError(err).data;
      Toast.show({
        type: "error",
        text1: "Error al crear usuario",
        text2: (error as any).errors[0] ?? "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
  const initAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      const storedUser = await AsyncStorage.getItem("user");

      // Si no hay token en storage, no intentamos validar
      if (!token) {
        await logout(false);
        return;
      }

      const res = await validateToken(token);

      // 🟢 CAMBIO: Verificamos explícitamente res.isSuccess y res.data
      if (res.isSuccess && res.data && storedUser) {
        setAuthToken(token);
        setUser(JSON.parse(storedUser));
        redirectByRole(token);
      } else {
        // Si el token no es válido según el negocio, limpiamos
        await logout(false);
      }
    } catch (e) {
      // 🟢 SOLUCIÓN AL CRASH: Si la API da 500 (Internal Server Error)
      // forzamos el cierre de sesión para limpiar estados y redirigir al login.
      console.log("Error fatal restaurando sesión:", mappingError(e));
      await logout(false); 
    } finally {
      setIsLoading(false);
    }
  };
  initAuth();
}, [redirectByRole]);

  return (
    <AuthContext.Provider value={{ signIn, signUp, isLoading, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
