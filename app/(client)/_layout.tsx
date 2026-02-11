import { ERole } from "@/src/domain/entities/UserEntity";
import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";
import { Stack } from "expo-router";

export default function ClienteLayout() {
  return (
    <ProtectedScreen allowedRoles={[ERole.CLIENTE]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ProtectedScreen>
  );
}
