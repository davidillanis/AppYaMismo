import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { confirmDelivery } from '@/src/domain/services/OrderService';
import { mappingError } from '@/src/infrastructure/configuration/security/DecodeToken';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { ManualCodeInput } from '@/src/presentation/components/delivery/ManualCodeInput';
import { QRScanner } from '@/src/presentation/components/delivery/QRScanner';
import { useUpdateOrder } from '@/src/presentation/hooks/useOrderMutation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
// Mock Order Data - En producción vendría del estado/API
type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};
const MOCK_ORDER = {
    id: 'ORD-9823',
    customer: 'Sin Nombre',
    address: 'Sin Direccion',
    phone: 'Sin Telefono',
    items: [{ name: 'Sin Nombre', quantity: 0, price: 0.00 }],
    total: 0,
};

const QrPage: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const orderId = typeof params.orderId === 'string' ? params.orderId : MOCK_ORDER.id;
    const customer = typeof params.customer === 'string' ? params.customer : MOCK_ORDER.customer;
    const address = typeof params.address === 'string' ? params.address : MOCK_ORDER.address;
    const phone = typeof params.phone === 'string' ? params.phone : MOCK_ORDER.phone;
    const total = typeof params.total === 'string' ? Number(params.total) : MOCK_ORDER.total;
    const updateOrder = useUpdateOrder();
    let items: OrderItem[] = MOCK_ORDER.items;

    if (typeof params.items === 'string') {
        try {
            items = JSON.parse(params.items) as OrderItem[];
        } catch {
            console.warn('Items inválidos, usando mock');
        }
    }


    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [showManualInput, setShowManualInput] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { width: screenWidth } = useWindowDimensions();
    const normalize = useCallback((size: number) => normalizeScreen(size, screenWidth), [screenWidth]);
    const styles = createStyles(colors, normalize);
    const [showOrderSummary, setShowOrderSummary] = useState(false);

    const handleCodeScanned = async (data: string) => {
        // Evitar lecturas múltiples si ya está procesando
        if (isProcessing) return;
        const json = JSON.parse(data);
        setIsProcessing(true);
        try {
            const response = await confirmDelivery(json.id, json.qrToken);
            Toast.show({
                type: 'success',
                text1: 'Entrega confirmada',
                text2: response.data,
                visibilityTime: 3000,
                topOffset: 60,
            });
            navigateToSuccess(json.id);
        } catch (error) {
            const err = (mappingError(error).data) as any
            Toast.show({
                type: 'error',
                text1: 'Error al confirmar entrega',
                text2: err.errors[0],
                visibilityTime: 3000,
                topOffset: 60,
            });
        }
        setIsProcessing(false);
    };

    const handleManualSubmit = async (code: string) => {
        setIsProcessing(true);
        try {
            const response = await confirmDelivery(Number(orderId), code);
            Toast.show({
                type: 'success',
                text1: 'Entrega confirmada',
                text2: response.data,
                visibilityTime: 3000,
                topOffset: 60,
            });
            setShowManualInput(false);
            navigateToSuccess(code);
        } catch (error) {
            setShowManualInput(false);
            const err = (mappingError(error).data) as any
            Toast.show({
                type: 'error',
                text1: 'Error al confirmar entrega',
                text2: err.errors[0],
                visibilityTime: 3000,
                topOffset: 60,
            });
        }

    };

    const navigateToSuccess = (code: string) => {
        router.replace({
            pathname: '/(dealer)/home/QrSuccess',
            params: {
                code,
                orderId,
                customerName: MOCK_ORDER.customer
            }
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)', 'transparent']} style={styles.headerGradient}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmar Entrega</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Order Summary Card */}
                <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.orderHeader}>
                        <View style={styles.orderBadge}>
                            <Ionicons name="receipt" size={16} color={colors.primary} />
                            <Text style={[styles.orderId, { color: colors.primary }]}>#{orderId}</Text>
                        </View>
                        <Text style={[{ color: colors.text }]}>{customer}</Text>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowOrderSummary(!showOrderSummary)}>
                            <Ionicons name={showOrderSummary ? "chevron-up" : "chevron-down"} size={24} color={colors.text} style={{ padding: normalize(7) }} />
                        </TouchableOpacity>
                    </View>

                    {showOrderSummary && (
                        <View>
                            <View style={styles.customerInfo}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="location" size={18} color={colors.textSecondary} />
                                    <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>{address}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="call" size={18} color={colors.success} />
                                    <Text style={[styles.phone, { color: colors.success }]}>{phone}</Text>
                                </View>
                            </View>

                            {/* Items Summary */}
                            <View style={styles.itemsSummary}>
                                <Text style={[styles.itemsTitle, { color: colors.textSecondary }]}>
                                    Productos ({items.length}) - S/. {total}
                                </Text>
                                <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                                    {items.map((item: any, index: number) => (
                                        <View key={index} style={styles.itemRow}>
                                            <Text style={[styles.itemQuantity, { color: colors.primary }]}>
                                                {item.quantity}x
                                            </Text>
                                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                                                S/ {(item.price * item.quantity).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* QR Scanner */}
            <View style={styles.scannerContainer}>
                <QRScanner
                    onCodeScanned={handleCodeScanned}
                    onRequestManualInput={() => setShowManualInput(true)}
                />
            </View>

            {/* Manual Input Button */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[styles.manualButton, { borderColor: colors.primary }]}
                    onPress={() => setShowManualInput(true)}
                >
                    <Ionicons name="keypad-outline" size={22} color={colors.primary} />
                    <Text style={[styles.manualButtonText, { color: colors.primary }]}>
                        No puedo escanear el QR
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Manual Input Modal */}
            <Modal visible={showManualInput} transparent={true} animationType="slide" onRequestClose={() => setShowManualInput(false)}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <ManualCodeInput colors={colors} onCodeSubmit={handleManualSubmit} onCancel={() => setShowManualInput(false)} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default QrPage;

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) => StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        position: 'absolute',
        top: normalize(15),
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    orderCard: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 6,
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
    },
    orderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    customerInfo: {
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    address: {
        fontSize: 14,
        flex: 1,
    },
    phone: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemsSummary: {
        marginTop: 8,
    },
    itemsTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    itemsList: {
        maxHeight: 80,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: 'bold',
        width: 30,
    },
    itemName: {
        fontSize: 14,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '500',
    },
    scannerContainer: {
        flex: 1,
    },
    footer: {
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 10,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    manualButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        elevation: 2,
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    manualButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
    },
});
