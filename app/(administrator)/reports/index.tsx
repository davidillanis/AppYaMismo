import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EOrderStatus } from '@/src/domain/entities/OrderEntity';
import { listOrder } from '@/src/domain/services/OrderService';

// Utilitario para formatear moneda (S/.)
const formatCurrency = (amount: number) => {
  return `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ReportsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const screenWidth = Dimensions.get('window').width;

  // Estado para filtros (Podrías expandir esto en el futuro)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // 1. OBTENCIÓN DE DATOS (CON DEBUG DE ERRORES)
  const { data: ordersWrapper, isLoading, isError, error } = useQuery({
    queryKey: ['admin-reports-full', timeRange],
    // 🔥 CAMBIO 1: Bajamos a 100 pedidos para probar si el backend aguanta
    // Si esto funciona, sabremos que el límite era el tamaño (size).
    queryFn: () => listOrder({ page: 0, size: 100 }), 
    staleTime: 1000 * 60 * 5, 
  });

  // 2. PROCESAMIENTO DE DATOS
  const stats = useMemo(() => {
    // --- ZONA DE DEBUG DE ERROR ---
    if (isLoading) {
        console.log("⏳ Cargando datos del servidor...");
        return null;
    }
    
    if (isError) {
        // 🔥 ESTO ES LO QUE NECESITAMOS VER
        console.error("❌ LA PETICIÓN FALLÓ:", error);
        // Intentamos ver si hay detalles del servidor (response data)
        // @ts-ignore
        if (error?.response) {
             // @ts-ignore
            console.error("   Status:", error.response.status);
             // @ts-ignore
            console.error("   Datos:", JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }

    if (!ordersWrapper?.data?.content) {
        console.log("⚠️ Petición exitosa, pero la lista 'content' llegó vacía o nula.");
        if (ordersWrapper) console.log("   Estructura recibida:", JSON.stringify(ordersWrapper, null, 2));
        return null;
    }
    // -----------------------------

    const orders = ordersWrapper.data.content;
    console.log(`✅ ÉXITO: Se descargaron ${orders.length} pedidos.`);

    // ... (El resto del código de filtros y cálculos sigue igual que antes) ...
    // COPIA AQUÍ LA LÓGICA DE CÁLCULO QUE YA TENÍAS (Filtro de fechas, salesMap, etc.)
    
    const now = new Date();
    const daysLimit = timeRange === '7d' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysLimit);
    cutoffDate.setHours(0, 0, 0, 0);

    const filteredOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      return orderDate >= cutoffDate;
    });

    const salesMap: Record<string, number> = {}; 
    for (let i = daysLimit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }); 
        salesMap[key] = 0;
    }

    let totalSales = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    filteredOrders.forEach(order => {
        if (order.orderStatus === EOrderStatus.ENTREGADO) {
            deliveredCount++;
            const amount = order.total || 0;
            totalSales += amount;
            
            if (order.createdAt) {
                const dateKey = new Date(order.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
                if (salesMap[dateKey] !== undefined) {
                    salesMap[dateKey] += amount;
                }
            }
        } else if (order.orderStatus === EOrderStatus.CANCELADO || order.orderStatus === EOrderStatus.RECHAZADO) {
            cancelledCount++;
        }
    });

    const avgTicket = deliveredCount > 0 ? totalSales / deliveredCount : 0;

    const lineData = Object.keys(salesMap).map(date => ({
        value: salesMap[date],
        label: date,
        dataPointText: salesMap[date] > 0 ? Math.round(salesMap[date]).toString() : '',
        labelTextStyle: { color: '#999', fontSize: 10, width: 30 },
    }));

    const pieData = [
        { value: deliveredCount, color: '#4CAF50', text: 'Entregados', focused: true },
        { value: cancelledCount, color: '#F44336', text: 'Fallidos' },
    ];
    
    if (deliveredCount === 0 && cancelledCount === 0) {
        pieData.push({ value: 1, color: '#E0E0E0', text: 'Sin datos' });
    }

    return { totalSales, deliveredCount, cancelledCount, avgTicket, lineData, pieData };
  }, [ordersWrapper, isLoading, isError, error, timeRange]);

  if (isLoading) {
    return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textSecondary }}>Analizando datos...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F8" />
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Reportes Financieros</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>Resumen de rendimiento</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setTimeRange(prev => prev === '7d' ? '30d' : '7d')}>
            <Text style={styles.filterText}>{timeRange === '7d' ? '7 Días' : '30 Días'}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. FILA DE TARJETAS (KPIs) */}
        <View style={styles.kpiRow}>
            {/* Ingresos */}
            <View style={[styles.card, styles.kpiCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="cash-outline" size={20} color="#2196F3" />
                </View>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Ingresos Totales</Text>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{formatCurrency(stats?.totalSales || 0)}</Text>
            </View>

            {/* Ticket Promedio */}
            <View style={[styles.card, styles.kpiCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="stats-chart-outline" size={20} color="#4CAF50" />
                </View>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Ticket Promedio</Text>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{formatCurrency(stats?.avgTicket || 0)}</Text>
            </View>
        </View>

        {/* 2. GRÁFICO DE TENDENCIA (LINEAL) */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Tendencia de Ventas</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>+{stats?.deliveredCount} pedidos</Text>
                </View>
            </View>
            
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <LineChart
                    data={stats?.lineData || []}
                    
                    // --- 1. CONFIGURACIÓN DE SCROLL ---
                    // adjustToWidth={true}  <-- LO QUITAMOS para permitir scroll
                    width={screenWidth - 90} // Define el ancho de la "ventana" visible
                    spacing={40}             // 🔥 Espacio fijo entre puntos (más legible)
                    initialSpacing={20}
                    endSpacing={20}
                    scrollToEnd={true}       // 🔥 Empieza mostrando los datos más recientes (derecha)
                    isAnimated={true}
                    
                    // --- 2. ESTILO VISUAL (Se mantiene igual) ---
                    color={colors.primary}
                    thickness={3}
                    curved
                    areaChart
                    startFillColor={colors.primary}
                    endFillColor="#ffffff"
                    startOpacity={0.2}
                    endOpacity={0.0}
                    
                    // --- 3. PUNTOS ---
                    dataPointsColor={colors.primary}
                    dataPointsRadius={4}
                    dataPointsWidth={20}     // Área táctil más grande para facilitar el toque
                    
                    // --- 4. EJES ---
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={colors.text}
                    rulesType="solid"
                    rulesColor={colors.text}
                    yAxisTextStyle={{ color: '#999', fontSize: 10 }}
                    yAxisLabelWidth={40}
                    
                    // --- 5. TOOLTIP (Mismo código) ---
                    pointerConfig={{
                        pointerStripUptoDataPoint: true,
                        pointerStripColor: colors.primary,
                        pointerStripWidth: 2,
                        strokeDashArray: [2, 5],
                        pointerColor: colors.primary,
                        radius: 4,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 120,
                        activatePointersOnLongPress: false,
                        autoAdjustPointerLabelPosition: false,
                        pointerLabelComponent: (items: any) => {
                          const value = items[0].value;
                          return (
                            <View style={{ 
                                height: 30, 
                                width: 80, 
                                backgroundColor: '#333', 
                                borderRadius: 4, 
                                justifyContent:'center', 
                                alignItems:'center',
                                marginTop: -10 
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight:'bold' }}>
                                S/. {value}
                              </Text>
                            </View>
                          );
                        },
                      }}
                />
            </View>
        </View>

        {/* 3. GRÁFICO DE EFECTIVIDAD (PIE) & DETALLES */}
        <View style={styles.rowContainer}>
            {/* Gráfico */}
            <View style={[styles.card, { flex: 1, marginRight: 10, alignItems: 'center', justifyContent:'center' }, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { marginBottom: 15 }, { color: colors.text }]}>Efectividad</Text>
                <PieChart
                    data={stats?.pieData || []}
                    donut
                    radius={60}
                    innerRadius={45}
                    innerCircleColor={'white'}
                    centerLabelComponent={() => {
                        return (
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                                {stats?.deliveredCount || 0}
                            </Text>
                        );
                    }}
                />
            </View>

            {/* Resumen Numérico */}
            <View style={[styles.card, { flex: 1, marginLeft: 10, justifyContent: 'center' }, { backgroundColor: colors.surface }]}>
                 <Text style={[styles.cardTitle, { marginBottom: 15 }, { color: colors.text }]}>Resumen</Text>
                 
                 <View style={styles.statItem}>
                    <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                    <View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Exitosos</Text>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.deliveredCount}</Text>
                    </View>
                 </View>

                 <View style={[styles.divider, { backgroundColor: colors.text }]} />

                 <View style={styles.statItem}>
                    <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
                    <View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cancelados</Text>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.cancelledCount}</Text>
                    </View>
                 </View>
            </View>
        </View>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  filterButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD'
  },
  filterText: { color: '#007AFF', fontWeight: '600', fontSize: 12, marginRight: 5 },
  
  scrollContent: { padding: 20 },
  
  // Estilos de Tarjetas
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // Sombra suave (Elevation)
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden'
  },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 5 },
  kpiCard: { flex: 1, alignItems: 'flex-start' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#4CAF50', fontSize: 11, fontWeight: 'bold' },

  rowContainer: { flexDirection: 'row' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statLabel: { fontSize: 12, color: '#666', width: 70 },
  statNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0', width: '100%' },
  
});