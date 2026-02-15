import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../../components/widgets/DrawerMenu';
import Header from '../../components/widgets/Header';
// import HistoryPage from './history/HistoryPage';
import Toast from 'react-native-toast-message';
import HomePage from './home/HomePage';
import NotificationPage from './notifications/NotificationPage';
import OrderPage from './order/OrderPage';
// import StatisticsPage from './statistics/StatisticsPage';

const DealerIndex: React.FC = () => {
    const authority = "Repartidor";
    const { user, logout } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];
    const isDark = colorScheme === 'dark';
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const normalize = (size: number) => normalizeScreen(size, width);
    type DealerTab = "Order" | "Statistics" | "Home" | "History" | "Profile" | "Notifications";
    const [activeTab, setActiveTab] = useState<DealerTab>("Home");

    const handleNavigate = (route: string) => {
        router.push(route as any);
        setIsDrawerOpen(false);
    };

    const handleTabChange = (tab: DealerTab) => {
        setActiveTab(tab);
    };
    const handleLogout = () => logout();

    const menuItems = [
        { icon: 'person-outline', title: 'Mi perfil', route: '/PerfilAdmi' },
    ];
    const quickAccessItems: { icon: string; selectIcon: string; title: string; color: string; enabled: boolean; tab?: DealerTab; route?: string }[] = [
        { icon: 'receipt-outline', selectIcon: 'receipt', title: 'Pedidos', color: colors.warning, enabled: true, tab: 'Order' },
        // { icon: 'stats-chart-outline', selectIcon: 'stats-chart', title: 'Estadisticas', color: colors.warning, enabled: false, tab: 'Statistics' },
        { icon: 'home-outline', selectIcon: 'home', title: 'Inicio', color: colors.warning, enabled: true, tab: 'Home' },
        // { icon: 'time-outline', selectIcon: 'time', title: 'Historial', color: colors.warning, enabled: false, tab: 'History' },
        { icon: 'person-outline', selectIcon: 'person', title: 'Perfil', color: colors.warning, enabled: true, route: '/ProfileUser' },
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
                        onProfilePress={() => {
                            /**handleTabChange("Notifications") */
                            Toast.show({
                                type: 'info',
                                text1: 'Notificaciones',
                                text2: 'Funcionalidad en Desarrollo'
                            });
                        }}
                        iconProfile="notifications-outline"
                    />

                    {activeTab === "History" || activeTab === "Statistics" || activeTab === "Home" ? (
                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {/* {activeTab === "History" && <HistoryPage />} */}
                            {/* {activeTab === "Statistics" && <StatisticsPage />} */}
                            {activeTab === "Home" && <HomePage />}
                        </ScrollView>
                    ) : (
                        <View style={styles.content}>
                            {activeTab === "Order" && <OrderPage />}
                            {activeTab === "Notifications" && <NotificationPage />}
                        </View>
                    )}
                    <LinearGradient colors={[colors.surface, colors.background]} style={styles.footer}>
                        <View style={styles.quickAccessSection}>
                            <View style={styles.quickAccessContainer}>
                                {quickAccessItems.map((item, index) => {
                                    const isActive = item.tab && activeTab === item.tab;
                                    return (
                                        <Animated.View key={index} style={[styles.quickAccessButton, !item.enabled && styles.quickAccessButtonDisabled]}>
                                            <TouchableOpacity
                                                onPress={() => item.tab ? handleTabChange(item.tab) : handleNavigate(item.route!)}
                                                accessibilityLabel={item.title}
                                                accessibilityRole="button"
                                                disabled={!item.enabled}
                                            >
                                                <View style={[styles.quickAccessIconContainer]}>
                                                    <Ionicons name={isActive ? item.selectIcon : item.icon as any} size={normalize(24)} color={item.color} />
                                                </View>
                                                <Text style={[
                                                    styles.quickAccessText,
                                                    isActive && styles.quickAccessTextActive
                                                ]}>{item.title}</Text>
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
        footer: { paddingBottom: normalize(5), paddingTop: normalize(5), elevation: 1, shadowColor: colors.secondary },
        quickAccessSection: { paddingHorizontal: normalize(20) },
        quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: normalize(8) },
        quickAccessIconContainer: { borderRadius: normalize(20), justifyContent: 'center', alignItems: 'center', },
        quickAccessText: { fontSize: normalize(12), fontWeight: '500', color: colors.textSecondary, textAlign: 'center', fontFamily: colors.fontSecondary },
        quickAccessButton: {},
        quickAccessButtonDisabled: { opacity: 0.5, cursor: 'not-allowed', },
        quickAccessTextActive: { fontWeight: "bold", color: colors.text }
    });

export default DealerIndex; 