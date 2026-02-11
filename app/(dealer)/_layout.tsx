import { ERole } from "@/src/domain/entities/UserEntity";
import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <ProtectedScreen allowedRoles={[ERole.REPARTIDOR]}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="order/MapScreenView" />
                <Stack.Screen name="home/MapMonitoring" />
                <Stack.Screen name="home/QrPage" />
                <Stack.Screen name="home/QrSuccess" />
            </Stack>
        </ProtectedScreen>
    )
}