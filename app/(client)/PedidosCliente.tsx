import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PedidosCliente: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const normalize = (size: number) => normalizeScreen(size, 390);

  // Categorías y estado seleccionado
  const categories = ['Todos', 'En espera', 'Recibidos', 'Cancelados'];
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');

  // Datos de ejemplo
  const pedidos = [
    { id: 1, name: 'Pollo a la Brasa', date: 'Lunes, Ene 12, 2026', restaurant: 'La Nueva Casona', total: 'S/. 44', status: 'En espera', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747871363/pollo-brasa_nee5gz.jpg' },
    { id: 2, name: 'Hamburguesa de pollo', date: 'Lunes, Ene 12, 2026', restaurant: 'Boogie Burger', total: 'S/. 24', status: 'En espera', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1768841697/Hamburguesa-de-pollo_k4mj9e.webp' },
    { id: 3, name: 'Sushi', date: 'Viernes, Ene 09, 2026', restaurant: 'Chifa Dragon', total: 'S/. 52', status: 'Cancelado', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1768841697/sushi_uptiud.webp' },
    { id: 4, name: 'Pollo a la brasa', date: 'Sábado, Ene 10, 2026', restaurant: 'El Zorro', total: 'S/. 75', status: 'Recibido', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1768841698/pollito_ikhnk6.webp' },
    { id: 5, name: 'Pizza', date: 'Jueves, Ene 08, 2026', restaurant: 'Hot Pizza', total: 'S/. 25', status: 'Recibido', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1768841697/OIP_3_oxda7q.webp' },
    { id: 6, name: 'Monstrito', date: 'Miércoles, Ene 07, 2026', restaurant: 'La Nueva Casona', total: 'S/. 18', status: 'Recibido', image: 'https://res.cloudinary.com/dlk4jsoqp/image/upload/v1768841697/monstrito_zseqg0.webp' },
  ];

  // Filtrar los pedidos según categoría
  const filteredPedidos =
    selectedCategory === 'Todos'
      ? pedidos
      : pedidos.filter((p) => p.status === selectedCategory);

  const styles = createStyles(normalize);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Pedidos</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="receipt-outline" size={22} color={colors.text} />
          </View>
        </View>

        {/* Lista principal */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Categorías */}
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryButton, selectedCategory === item && styles.activeCategory]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.activeCategoryText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryContainer}
          />

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {selectedCategory === 'Todos'
              ? 'Todos los pedidos realizados'
              : `Pedidos ${selectedCategory.toLowerCase()}`}
          </Text>

          {/* Botón Generar QR solo para "En espera" */}
          {selectedCategory === 'En espera' && (
            <TouchableOpacity
              style={styles.generateQRButton}
              onPress={() => router.push('/GenerateQR')}
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.generateQRText}>Generar QR</Text>
            </TouchableOpacity>
          )}

          {/* Lista de pedidos filtrados */}
          {filteredPedidos.map((pedido) => (
            <View key={pedido.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <Image source={{ uri: pedido.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{pedido.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{pedido.date}</Text>
                <Text style={[styles.cardRestaurant, { color: colors.textSecondary }]}>{pedido.restaurant}</Text>

                <View style={styles.cardFooter}>
                  <Text
                    style={[
                      styles.status,
                      pedido.status === 'En espera' && styles.statusEspera,
                      pedido.status === 'Recibido' && styles.statusRecibido,
                      pedido.status === 'Cancelado' && styles.statusCancelado,
                    ]}
                  >
                    {pedido.status}
                  </Text>

                  {pedido.status === 'En espera' && (
                    <TouchableOpacity style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}

                  {pedido.status === 'Cancelado' && (
                    <TouchableOpacity style={styles.reorderButton}>
                      <Text style={styles.reorderText}>Reordenar</Text>
                    </TouchableOpacity>
                  )}

                  {pedido.status === 'Recibido' && (
                    <View style={styles.receivedContainer}>
                      <Ionicons name="checkmark-circle" size={18} color="#00B341" />
                      <Text style={styles.receivedText}>Recibido</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>{pedido.total}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Botón flotante de Rastreo */}
        {(selectedCategory === 'En espera' || selectedCategory === 'Todos') && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => router.push('/RastreoPedido')}
          >
            <Ionicons name="location" size={40} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </>
  );
};

// Estilos
const createStyles = (normalize: (n: number) => number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E7D6B9' },
    scroll: { paddingHorizontal: 15 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: '#D9C4A1',
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: normalize(17),
      color: '#000',
    },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    categoryContainer: {
      flexDirection: 'row',
      marginVertical: 15,
      paddingRight: 10,
      justifyContent: 'space-between',
    },
    categoryButton: {
      backgroundColor: '#BFA181',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginRight: 10,
    },
    categoryText: { color: '#000', fontWeight: '600' },
    activeCategory: { backgroundColor: '#A4243B' },
    activeCategoryText: { color: '#fff' },
    sectionTitle: {
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: '#3C2E20',
      marginBottom: 10,
    },
    generateQRButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: '#A4243B',
      borderRadius: 10,
      paddingHorizontal: 100,
      paddingVertical: 10,
      marginBottom: 15,
    },
    generateQRText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: normalize(13),
      marginLeft: 8,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: '#2D2D2D',
      borderRadius: 15,
      padding: 10,
      marginBottom: 15,
      alignItems: 'center',
    },
    cardImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 10,
    },
    cardContent: { flex: 1 },
    cardTitle: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: normalize(14),
    },
    cardSubtitle: { color: '#ccc', fontSize: normalize(11) },
    cardRestaurant: { color: '#ccc', fontSize: normalize(12), marginBottom: 4 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    status: { fontWeight: '600', fontSize: normalize(12) },
    statusEspera: { color: '#FC9E4F' },
    statusRecibido: { color: '#00B341' },
    statusCancelado: { color: '#C42021' },
    cancelButton: {
      backgroundColor: '#E32020',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: 10,
    },
    cancelText: { color: '#fff', fontWeight: '600', fontSize: normalize(12) },
    reorderButton: {
      backgroundColor: '#00B341',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginLeft: 10,
    },
    reorderText: { color: '#fff', fontWeight: '600', fontSize: normalize(12) },
    receivedContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    receivedText: {
      color: '#00B341',
      fontWeight: '600',
      fontSize: normalize(12),
      marginLeft: 3,
    },
    totalContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    totalLabel: { color: '#fff', fontSize: normalize(12) },
    totalValue: { color: '#fff', fontWeight: 'bold', fontSize: normalize(13) },
    floatingButton: {
      position: 'absolute',
      bottom: 60,
      right: 25,
      backgroundColor: '#A4243B',
      borderRadius: 50,
      padding: 10,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
  });

export default PedidosCliente;


