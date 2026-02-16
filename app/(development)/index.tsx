import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../../components/widgets/DrawerMenu';
import Header from '../../components/widgets/Header';
import ProfileCard from '../../components/widgets/ProfileCard';
import ServiceCard from '../../components/widgets/ServiceCard';

const FuncionarioIndex: React.FC = () => {
  const authority = "Development";
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  //const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * (width / 375)));
  const normalize = (size: number) => normalizeScreen(size, width);

  const handleNavigate = (route: string) => {
    router.push(route as any);
    setIsDrawerOpen(false);
  };

  const handleLogout = () => logout();

  // Configuración de elementos del menú
  const menuItems = [
    { icon: 'person-outline', title: 'Mi perfil', route: '/PerfilAdmi' },
  ];

  // Configuración de tarjetas de servicios
  const serviceCards = [
    { icon: 'home-outline', title: 'BasePage', description: 'Un ejemplo de Pagina base', route: '/base/BasePage', color: colors.primary },
    { icon: 'map-outline', title: 'Monitoreo', description: 'Monitoreo MI UBICACIÓN', route: '/maps/RestaurantMap', color: colors.primary },
    { icon: 'pulse-outline', title: 'Socket', description: 'Test de socket', route: '/socket/SocketIndex', color: colors.primary },
    { icon: 'chatbubble-ellipses-outline', title: 'ChatBot', description: 'Funcionalidad De cámara', route: '/ai-chat', color: colors.primary },
    { icon: 'receipt-outline', title: 'DealerPage', description: 'Gestionar pedidos', route: '/dealer/DealerPage', color: colors.secondary },
    { icon: 'map-outline', title: 'Monitoreo', description: 'Monitoreo MI UBICACIÓN', route: '/maps/MapScreen', color: colors.primary },
  ];

  const quickAccessItems = [
    { icon: 'gift-outline', title: 'Premios', route: '/CanjearPremios', color: colors.tertiary },
    { icon: 'location', title: 'Mapa', route: '/mapa', color: colors.info },
    { icon: 'notifications-outline', title: 'Alertas', route: '/chat', color: colors.warning },
  ];

  const styles = createStyles(colors, normalize, width);
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
      <Drawer
        open={isDrawerOpen}
        onOpen={() => setIsDrawerOpen(true)}
        onClose={() => setIsDrawerOpen(false)}
        drawerType={width >= 1024 ? 'permanent' : 'front'}
        drawerPosition="left"
        overlayStyle={{ backgroundColor: 'rgba(221, 215, 215, 0.5)' }}
        drawerStyle={{
          backgroundColor: colors.surface,
          width: width >= 1024 ? Math.min(width * 0.25, 400) : width >= 768 ? Math.min(width * 0.35, 320) : width * 0.85
        }}
        renderDrawerContent={() => (
          <DrawerMenu
            colors={colors}
            user={user}
            screenWidth={width}
            authority={authority}
            menuItems={menuItems}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
      >
        <SafeAreaView style={styles.container}>
          <Header
            colors={colors}
            screenWidth={width}
            onMenuPress={() => setIsDrawerOpen(true)}
            onProfilePress={() => router.push('/ProfileUser')}
          />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>¡Hola, {user?.name}! 👋</Text>
              <Text style={styles.subtitle}>Panel de {authority}</Text>
            </View>

            <ProfileCard
              colors={colors}
              user={user}
              authority={authority}
              screenWidth={width}
              onEditPress={() => handleNavigate('/PerfilAdmi')}
            />
            <ServiceCard
              colors={colors}
              screenWidth={width}
              serviceCards={serviceCards}
              onNavigate={handleNavigate}
            />


          </ScrollView>

          <LinearGradient colors={[colors.surface, colors.background]} style={styles.footer}>
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>Acceso rápido</Text>
              <View style={styles.quickAccessContainer}>
                {quickAccessItems.map((item, index) => {

                  return (
                    <Animated.View key={index} style={[styles.quickAccessButton]}>
                      <TouchableOpacity
                        onPress={() => handleNavigate(item.route)}
                        accessibilityLabel={item.title}
                        accessibilityRole="button"
                      >
                        <View style={[styles.quickAccessIconContainer, { backgroundColor: `${item.color}15` }]}>
                          <Ionicons name={item.icon as any} size={normalize(24)} color={item.color} />
                        </View>
                        <Text style={styles.quickAccessText}>{item.title}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Drawer>
    </>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number, screenWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flex: 1
    },
    greetingContainer: {
      padding: 20
    },
    greeting: {
      fontSize: normalize(28),
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: colors.fontPrimary
    },
    subtitle: {
      fontSize: normalize(16),
      color: colors.textSecondary,
      fontFamily: colors.fontSecondary
    },
    // Updated Footer Styles
    footer: { paddingBottom: normalize(10), borderTopWidth: 1, borderTopColor: colors.border, elevation: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    quickAccessSection: { paddingHorizontal: normalize(20), paddingVertical: normalize(10) },
    quickAccessTitle: { fontSize: normalize(18), fontWeight: '600', color: colors.text, marginBottom: normalize(12), fontFamily: colors.fontPrimary },
    quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: normalize(8) },
    quickAccessButton: { backgroundColor: colors.card, borderRadius: normalize(12), padding: normalize(16), alignItems: 'center', flex: 1, minWidth: normalize(80), maxWidth: normalize(120), borderWidth: 1, borderColor: colors.border, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    quickAccessIconContainer: { width: normalize(40), height: normalize(40), borderRadius: normalize(20), justifyContent: 'center', alignItems: 'center', marginBottom: normalize(8) },
    quickAccessText: { fontSize: normalize(12), fontWeight: '500', color: colors.textSecondary, textAlign: 'center', fontFamily: colors.fontSecondary },

  });

export default FuncionarioIndex; 