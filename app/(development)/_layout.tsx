import { ERole } from "@/src/domain/entities/UserEntity";
import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <ProtectedScreen allowedRoles={[ERole.DEVELOPMENT]}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="dealer/DealerPage" />
                <Stack.Screen name="socket/SocketIndex" />
                <Stack.Screen name="maps/MapScreen" />
                <Stack.Screen name="base/BasePage" />
            </Stack>
        </ProtectedScreen>
    )
}