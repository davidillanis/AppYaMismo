import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
// 🔥 Importamos el hook que creamos
import { useDashboardStats } from "@/src/presentation/hooks/useDashboardStats";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, // Importante para loading
  RefreshControl, // Importante para recargar
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView } from "react-native-safe-area-context";
import DrawerMenu from "../../components/widgets/DrawerMenu";
import Header from "../../components/widgets/Header";

const ADMIN_MODULES = [
  {
    id: 'restaurants',
    title: 'Restaurantes',
    subtitle: 'Gestión de locales y menús',
    icon: 'restaurant',
    route: '/(administrator)/restaurants',
    color: '#FF9800'
  },
  {
    id: 'orders',
    title: 'Pedidos',
    subtitle: 'Monitoreo en tiempo real',
    icon: 'receipt',
    route: '/(administrator)/orders',
    color: '#2196F3'
  },
  {
    id: 'dealers',
    title: 'Repartidores',
    subtitle: 'Gestión de flota y asignación',
    icon: 'bicycle',
    route: '/(administrator)/dealers',
    color: '#4CAF50'
  },
  {
    id: 'settings',
    title: 'Configuración',
    subtitle: 'Ajustes generales del sistema',
    icon: 'settings',
    route: '/(administrator)/settings',
    color: '#607D8B'
  },
  {
    id: 'assignments',
    title: 'Asignaciones',
    subtitle: 'Supervisar y asignar pedidos',
    icon: 'map',
    route: '/(administrator)/assignments',
    color: '#9C27B0'
  },
  {
    id: 'users',
    title: 'Usuarios',
    subtitle: 'Gestión de usuarios del sistema',
    icon: 'people',
    route: '/(administrator)/users',
    color: '#FF5722'
  },
  {
    id: 'reports',
    title: 'Reportes',
    subtitle: 'Análisis de rendimiento',
    icon: 'bar-chart-outline',
    route: '/(administrator)/reports',
    color: '#FFC107'
  }
];

const AdministratorIndex: React.FC = () => {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const isDark = colorScheme === "dark";
  const { width } = useWindowDimensions();
  const router = useRouter();
  const normalize = (size: number) => normalizeScreen(size, width);
  const styles = createStyles(colors, normalize);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 🔥 1. Hook de Datos Reales
  const { data: stats, isLoading, refetch } = useDashboardStats();

  const handleNavigate = (route: string) => {
    router.push(route as any);
    setIsDrawerOpen(false);
  };

  const handleModulePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.primary}
      />
      <Drawer
        open={isDrawerOpen}
        onOpen={() => setIsDrawerOpen(true)}
        onClose={() => setIsDrawerOpen(false)}
        drawerType="front"
        renderDrawerContent={() => (
          <DrawerMenu
            colors={colors}
            user={user}
            screenWidth={width}
            authority="Administrador"
            menuItems={[
              { icon: "person-outline", title: "Mi perfil", route: "/ProfileUser" }
            ]}
            onNavigate={handleNavigate}
            onLogout={logout}
          />
        )}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <Header
            colors={colors}
            screenWidth={width}
            onMenuPress={() => setIsDrawerOpen(true)}
            onProfilePress={() => router.push('/(tabs)/ProfileUser')}
          />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            // 🔥 2. Pull-to-Refresh activado
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {/* 1. SECCIÓN DE BIENVENIDA */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.greeting, { color: colors.text }]}>Hola, Admin {user?.name}</Text>
              <Text style={[styles.date, { color: colors.text }]}>Resumen del día</Text>
            </View>

            {/* 2. KPIs PRINCIPALES (Datos Reales) */}
            <View style={styles.kpiContainer}>
              {/* Tarjeta 1: Pedidos */}
              <View style={[styles.kpiCard, { backgroundColor: colors.primary }]}>
                <View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" style={{ alignSelf: 'flex-start' }} />
                  ) : (
                    <Text style={styles.kpiValue}>{stats?.totalOrdersToday || 0}</Text>
                  )}
                  <Text style={styles.kpiLabel}>Pedidos Hoy</Text>
                </View>
                <Ionicons name="cart-outline" size={28} color="rgba(255,255,255,0.8)" />
              </View>

              {/* Tarjeta 2: Motorizados */}
              <View style={[styles.kpiCard, { backgroundColor: '#2E8B57' }]}>
                <View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" style={{ alignSelf: 'flex-start' }} />
                  ) : (
                    <Text style={styles.kpiValue}>{stats?.activeRiders || 0}</Text>
                  )}
                  <Text style={styles.kpiLabel}>Motorizados</Text>
                </View>
                <Ionicons name="bicycle-outline" size={28} color="rgba(255,255,255,0.8)" />
              </View>

              {/* 🔥 Tarjeta 3: Restaurantes (Nueva) */}
              <View style={[styles.kpiCard, { backgroundColor: '#FF9800' }]}>
                <View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" style={{ alignSelf: 'flex-start' }} />
                  ) : (
                    <Text style={styles.kpiValue}>{stats?.activeRestaurants || 0}</Text>
                  )}
                  <Text style={styles.kpiLabel}>Restaurantes</Text>
                </View>
                <Ionicons name="restaurant-outline" size={28} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {/* 3. GRID DE MÓDULOS */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Módulos de Gestión</Text>
            <View style={styles.modulesGrid}>
              {ADMIN_MODULES.map((module) => (
                <TouchableOpacity
                  key={module.id}
                  style={[styles.moduleCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleModulePress(module.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: module.color + '20' }]}>
                    <Ionicons name={module.icon as any} size={28} color={module.color} />
                  </View>
                  <View style={styles.moduleTextContainer}>
                    <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
                    <Text style={[styles.moduleSubtitle, { color: colors.text }]}>{module.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. RESUMEN DE ACTIVIDAD (Datos Reales) */}
            <View style={styles.activityContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Estado de la Operación</Text>
              <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
                {isLoading && !stats ? (
                  <View style={{ padding: 20 }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 10 }}>Cargando...</Text>
                  </View>
                ) : (
                  (() => {
                    // 1. Calculamos el total real sumando las cantidades
                    const distribution = stats?.statusDistribution || { "Sin datos": 0 };
                    const totalOps = Object.values(distribution).reduce((a, b) => a + b, 0) || 1; // Evitar división por 0

                    return Object.entries(distribution).map(([key, value]) => {
                      const count = typeof value === 'number' ? value : 0;
                      // 2. Calculamos porcentaje SOLO para el ancho visual de la barra
                      const visualPercentage = (count / totalOps) * 100;

                      return (
                        <View key={key} style={styles.statRow}>
                          {/* Etiqueta */}
                          <View style={styles.statLabelContainer}>
                            <Text style={[styles.statLabel, { color: colors.text }]}>{key}</Text>
                          </View>

                          {/* Barra Visual */}
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  // El ancho sigue siendo porcentaje para que se vea bien
                                  width: `${visualPercentage}%`,
                                  backgroundColor:
                                    key === 'Entregado' ? '#4CAF50' :
                                      key === 'En proceso' ? '#2196F3' :
                                        key === 'En espera' || key === 'Sin datos' ? '#FFC107' : '#9E9E9E'
                                }
                              ]}
                            />
                          </View>

                          {/* 🔥 VALOR EN ENTEROS (Ej: "5") */}
                          <Text style={[styles.statValue, { color: colors.text }]}>{count}</Text>
                        </View>
                      );
                    });
                  })()
                )}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Drawer>
    </>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    content: { flex: 1, padding: 20 },

    // Bienvenida
    welcomeSection: { marginBottom: 20 },
    greeting: { fontSize: normalize(22), fontWeight: "bold", color: "#333" },
    date: { fontSize: normalize(14), color: "#666", marginTop: 4 },

    // KPIs (Ajustado para 3 columnas)
    kpiContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 25,
      gap: 10 // Reduje el gap para que quepan 3
    },
    kpiCard: {
      flex: 1,
      borderRadius: 16,
      padding: 12, // Menos padding para optimizar espacio
      // Cambiamos a columna para que el icono y texto se apilen bien en pantallas angostas
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start", // Alineado a la izquierda
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      minHeight: 100 // Altura mínima consistente
    },
    kpiValue: { fontSize: normalize(20), fontWeight: "bold", color: "#fff", marginBottom: 5 },
    kpiLabel: { fontSize: normalize(11), color: "rgba(255,255,255,0.9)", fontWeight: '600' },

    // Títulos
    sectionTitle: {
      fontSize: normalize(18),
      fontWeight: "bold",
      color: "#333",
      marginBottom: 15,
      marginLeft: 5
    },

    // Grid de Módulos
    modulesGrid: {
      marginBottom: 25,
      gap: 15,
    },
    moduleCard: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 1 }
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15
    },
    moduleTextContainer: { flex: 1 },
    moduleTitle: { fontSize: normalize(16), fontWeight: "bold", color: "#333" },
    moduleSubtitle: { fontSize: normalize(12), color: "#888", marginTop: 2 },

    // Actividad
    activityContainer: { marginBottom: 20 },
    activityCard: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 20,
      elevation: 2
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15
    },
    statLabelContainer: { width: 80 },
    statLabel: { fontSize: normalize(12), fontWeight: '600', color: '#555' },
    progressBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      marginHorizontal: 10,
      overflow: 'hidden'
    },
    progressBarFill: { height: '100%', borderRadius: 4 },
    statValue: { fontSize: normalize(12), fontWeight: 'bold', color: '#333', width: 35, textAlign: 'right' }
  });

export default AdministratorIndex;