import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks y Contextos
import DrawerMenu from '@/components/widgets/DrawerMenu';
import Header from '@/components/widgets/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { useRestaurantList } from '@/src/presentation/hooks/useRestaurantList';

import { Drawer } from 'react-native-drawer-layout';

export default function RestaurantSelectionScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { width } = useWindowDimensions();
  // 1. OBTENER MIS RESTAURANTES
  const { data: restData, isLoading } = useRestaurantList({
    userId: user?.id,
    enabled: true, // Opcional: si quieres ver también los inactivos, quita esto
    size: 100
  });

  const myRestaurants = restData?.data?.content || [];

  const handleSelectRestaurant = (id: number) => {
    // 🚀 NAVEGACIÓN DINÁMICA: Pasamos el ID a la siguiente pantalla
    router.push(`./menu/${id}`);
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface || 'white' }]}
      onPress={() => handleSelectRestaurant(item.id)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.urlImagen || "https://via.placeholder.com/150" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address || "Sin dirección registrada"}</Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: item.enabled ? colors.success : colors.error }]} />
          <Text style={{ color: item.enabled ? colors.success : colors.error, fontSize: 12 }}>
            {item.enabled ? 'Operativo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      drawerType="front"
      renderDrawerContent={() => (
        <DrawerMenu
          colors={colors}
          user={user}
          screenWidth={390}
          authority="Cliente"
          menuItems={[
            { icon: "person-outline", title: "Mi perfil", route: "/ProfileUser" },
          ]}
          onNavigate={(r) => { router.push(r as any); setIsDrawerOpen(false); }}
          onLogout={logout}
        />
      )}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <Header
          colors={colors}
          screenWidth={width}
          onMenuPress={() => setIsDrawerOpen(true)}
          onProfilePress={() => router.push('/ProfileUser')}
          title='Restaurante'
          subTitle='YaMismo'
        />
        {/* Header Simple con Logout */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Bienvenido,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis Restaurantes</Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={myRestaurants}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRestaurantItem}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: '#888' }}>No tienes restaurantes asignados.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20
  },
  welcomeText: { fontSize: 14 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginLeft: 20, marginBottom: 10 },

  // Card Styles
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 15,
    borderRadius: 16,
    // Sombra
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee' },
  cardContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardAddress: { fontSize: 12, color: '#888', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 }
});