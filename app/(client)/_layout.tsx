//import { ERole } from "@/src/domain/entities/UserEntity";
//import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";
import { Stack } from "expo-router";

export default function ClienteLayout() {
  // 🟢 Eliminamos ProtectedScreen para que la pantalla index sea pública
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* Otras pantallas que sí requieran login deberían protegerse individualmente o en otro sub-layout */}
    </Stack>
  );
}
