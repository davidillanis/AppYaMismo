import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'order' | 'system' | 'promotion';
}

const initialNotifications: NotificationItem[] = [
    {
        id: '1',
        title: 'Nuevo pedido asignado',
        message: 'Tienes un nuevo pedido #1234 pendiente de entrega.',
        date: 'Hace 5 min',
        read: false,
        type: 'order'
    },
    {
        id: '2',
        title: 'Pedido entregado con éxito',
        message: 'El pedido #1230 fue marcado como entregado.',
        date: 'Hace 1 hora',
        read: true,
        type: 'order'
    },
    {
        id: '3',
        title: 'Actualización del sistema',
        message: 'La aplicación se actualizará esta noche para mejorar el rendimiento.',
        date: 'Ayer',
        read: true,
        type: 'system'
    },
    {
        id: '4',
        title: '¡Gana más hoy!',
        message: 'Completa 5 entregas hoy y recibe un bono extra.',
        date: 'Hace 2 días',
        read: false,
        type: 'promotion'
    }
];

const NotificationPage: React.FC = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];
    const { width } = useWindowDimensions();
    const normalize = (size: number) => normalizeScreen(size, width);
    const styles = createStyles(colors, normalize);

    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return 'bicycle-outline';
            case 'system': return 'settings-outline';
            case 'promotion': return 'gift-outline';
            default: return 'notifications-outline';
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, !item.read && styles.unreadIconContainer]}>
                <Ionicons name={getIcon(item.type) as any} size={normalize(24)} color={item.read ? colors.textSecondary : colors.primary} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                    {!item.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                {notifications.some(n => !n.read) && (
                    <TouchableOpacity onPress={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                        <Text style={styles.markAllRead}>Marcar todo como leído</Text>
                    </TouchableOpacity>
                )}
            </View>

            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={normalize(64)} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>No tienes notificaciones</Text>
                </View>
            )}
        </View>
    );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: normalize(20),
            paddingVertical: normalize(15),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: normalize(24),
            fontWeight: 'bold',
            color: colors.text,
            fontFamily: colors.fontPrimary
        },
        markAllRead: {
            fontSize: normalize(14),
            color: colors.primary,
            fontWeight: '600',
            fontFamily: colors.fontSecondary
        },
        listContent: {
            paddingHorizontal: normalize(20),
            paddingBottom: normalize(20),
        },
        notificationItem: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            padding: normalize(15),
            borderRadius: normalize(12),
            marginBottom: normalize(10),
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            borderLeftWidth: 4,
            borderLeftColor: 'transparent',
        },
        unreadItem: {
            backgroundColor: colors.card, // Assuming card is slightly different or just use surface with highlight
            borderLeftColor: colors.primary,
        },
        iconContainer: {
            width: normalize(40),
            height: normalize(40),
            borderRadius: normalize(20),
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: normalize(15),
        },
        unreadIconContainer: {
            backgroundColor: colors.background, // Or a light tint of primary if available
        },
        contentContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: normalize(4),
        },
        title: {
            fontSize: normalize(16),
            fontWeight: '600',
            color: colors.text,
            fontFamily: colors.fontPrimary,
            flex: 1,
        },
        unreadTitle: {
            fontWeight: 'bold',
            color: colors.text,
        },
        message: {
            fontSize: normalize(14),
            color: colors.textSecondary,
            fontFamily: colors.fontSecondary,
            marginBottom: normalize(6),
            lineHeight: normalize(20),
        },
        date: {
            fontSize: normalize(12),
            color: colors.textSecondary,
            opacity: 0.7,
            fontFamily: colors.fontSecondary
        },
        dot: {
            width: normalize(8),
            height: normalize(8),
            borderRadius: normalize(4),
            backgroundColor: colors.primary,
            marginLeft: normalize(8),
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: normalize(50),
        },
        emptyText: {
            marginTop: normalize(10),
            fontSize: normalize(16),
            color: colors.textSecondary,
            fontFamily: colors.fontSecondary
        }
    });

export default NotificationPage;
