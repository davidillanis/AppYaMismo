// src/presentation/components/ProtectedScreen.tsx
import { ERole } from "@/src/domain/entities/UserEntity";
import { rolesByToken } from "@/src/infrastructure/configuration/security/DecodeToken";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

type ProtectedScreenProps = {
  children: React.ReactNode;
  allowedRoles: ERole[];
};

const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.accessToken) {
      router.replace("/(auth)");
      return;
    }
    const userRoles = rolesByToken(user.accessToken);
    const hasAccess = userRoles.some((role) =>
      allowedRoles.includes(role as ERole)
    );
    if (!hasAccess) {
        Toast.show({
          type: "error",
          text1: "Acceso denegado",
          text2: "No tienes permiso para acceder a esta sección",
        });
        router.replace("/(auth)");
    }
  }, [user, allowedRoles, router]);

  if (!user?.accessToken) return null;

  return <>{children}</>;
};

export default ProtectedScreen;
