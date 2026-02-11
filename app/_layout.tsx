import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/src/presentation/context/AuthContext";
import staticToastConfig from "@/src/presentation/shared/config/toastConfig";
// Importa el componente que creamos arriba
import AnimatedSplash from "../components/AnimatedSplash"; // Ajusta la ruta

import { CartProvider } from "@/src/presentation/context/CartContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      // Ocultamos el splash NATIVO (la imagen estática)
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Aún se ve el splash nativo
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              {/* 1. LA NAVEGACIÓN ESTÁ SIEMPRE AQUÍ ABAJO */}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                {/* Resto de tus pantallas... */}
              </Stack>

              {/* 2. EL SPLASH SE PONE ENCIMA COMO UNA CAPA */}
              {isSplashVisible && (
                <AnimatedSplash onFinish={() => setIsSplashVisible(false)} />
              )}

              <Toast config={staticToastConfig} />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </View>
  );
}
