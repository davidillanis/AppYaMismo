import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useProductFeed } from "@/src/presentation/hooks/useProductFeed";
import { useDeleteProduct, useUpdateProduct } from "@/src/presentation/hooks/useProductMutation";
import { useRestaurantById } from "@/src/presentation/hooks/useRestaurantById";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes
import { CategoryChip } from "@/src/presentation/components/filters/CategoryChip";
import { ProductStatusFilter } from "@/src/presentation/components/filters/ProductStatusFilter";

const RestaurantMenuScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const currentRestaurantId = Number(id);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const isDark = colorScheme === "dark";
  const normalize = (size: number) => normalizeScreen(size, 390);

  // Estados UI
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todo");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});


  // Data Hooks
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurantById(currentRestaurantId);
  const { products, categories, isLoadingInitial } = useProductFeed(
    currentRestaurantId,
    searchText,
    selectedCategory
  );
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  // Filtrado
  const filteredProducts = products.filter((p) => {
    if (selectedStatus === "ALL") return true;
    if (selectedStatus === "ACTIVE") return p.enabled !== false;
    if (selectedStatus === "INACTIVE") return p.enabled === false;
    return true;
  });

  // Handlers
  const toggleAvailability = (item: { id: number; enabled?: boolean }) => {
    const newEnabled = !(item.enabled ?? true);
    updateProduct({ id: item.id, payload: { enabled: newEnabled } });
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    Alert.alert("Eliminar", `¿Eliminar "${productName}"?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteProduct(productId) }
    ]);
  };

  const styles = createStyles(colors, normalize);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* --- HEADER --- */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
             <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {loadingRestaurant ? "Cargando..." : restaurant?.name}
             </Text>
             <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gestión de Carta</Text>
        </View>
      </View>

      {/* 🔍 BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar plato..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* 🎛 FILTROS */}
      <View>
        <ProductStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          backgroundColor={colors.background}
          colors={colors}
        />
        <View style={{ paddingLeft: 15, paddingBottom: 10 }}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <CategoryChip
                        name={item}
                        isSelected={selectedCategory === item}
                        onSelect={() => setSelectedCategory(item)}
                    />
                )}
            />
        </View>
      </View>

      {/* 📋 LISTA PRODUCTOS */}
      {isLoadingInitial ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface || 'white' }]}>
              {/* Contenedor de Imagen con Loader */}
              <View style={styles.imageContainer}>
                {imageLoading[item.id] && (
                  <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} />
                )}
                <Image
                  source={{ uri: item.urlImage || "https://via.placeholder.com/100" }}
                  style={styles.cardImage}
                  onLoadStart={() => setImageLoading(prev => ({...prev, [item.id]: true}))}
                  onLoadEnd={() => setImageLoading(prev => ({...prev, [item.id]: false}))}
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                  {/* Precio Principal */}
                  <Text style={styles.priceText}>
                    {item.variant?.[0] ? `S/.${item.variant[0].price.toFixed(2)}` : '--'}
                  </Text>
                </View>

                {/* Estado y Switch */}
                <View style={styles.rowBetween}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: item.enabled ? '#2ECC71' : '#E74C3C' }]} />
                        <Text style={{ fontSize: 12, color: item.enabled ? '#2ECC71' : '#E74C3C', fontWeight: '600' }}>
                            {item.enabled ? "Disponible" : "Agotado"}
                        </Text>
                    </View>
                    <Switch
                        value={item.enabled ?? true}
                        onValueChange={() => toggleAvailability(item)}
                        trackColor={{ false: "#ccc", true: colors.primary + "80" }}
                        thumbColor={item.enabled ? colors.primary : "#f4f3f4"}
                    />
                </View>

                {/* Botones Editar/Eliminar */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push({ pathname: "/(restaurant)/EditarProducto", params: { id: item.id } } as any)}
                    >
                        <Ionicons name="create-outline" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteProduct(item.id, item.name)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centerLoader}>
                <Text style={styles.emptyText}>No hay productos que coincidan.</Text>
            </View>
          }
        />
      )}

      {/* ⚡️ BOTONES FLOTANTES (FABs) - FUERA DE LA FLATLIST */}
      <TouchableOpacity
        style={styles.fabOrders}
        onPress={() => router.push({
            pathname: "/(restaurant)/ListarOrdenes",
            params: { restaurantId: currentRestaurantId }
        })}
        activeOpacity={0.8}
      >
        <Ionicons name="receipt-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabAdd}
        onPress={() => router.push({
            pathname: "/(restaurant)/AgregarProducto",
            params: { restaurantId: currentRestaurantId }
        })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, normalize: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingBottom: 5 },
  backButton: { marginRight: 10, padding: 5 },
  title: { fontSize: normalize(20), fontWeight: "bold" },
  subtitle: { fontSize: normalize(14) },
  searchContainer: {
      flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
      marginHorizontal: 15, marginVertical: 10, paddingHorizontal: 10,
      borderRadius: 12, borderWidth: 1, borderColor: "#eee", height: 45,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  // Estilos de Tarjeta Mejorados
  card: {
      flexDirection: "row", marginBottom: 12, borderRadius: 16, padding: 10,
      elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 4,
  },
  imageContainer: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee' },
  cardImage: { width: '100%', height: '100%' },
  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between', paddingVertical: 2 },
  cardTitle: { fontWeight: "700", fontSize: 15, flex: 1, marginRight: 5 },
  priceText: { fontWeight: "700", fontSize: 15, color: colors.primary },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  buttonRow: { flexDirection: "row", marginTop: 8, justifyContent: 'flex-end' },
  editButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
  deleteButton: { backgroundColor: "#fee2e2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: "#fff", marginLeft: 4, fontWeight: "600", fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 16 },
  // Estilos de FABs
  fabOrders: {
      position: "absolute", bottom: 100, right: 20, width: 50, height: 50, borderRadius: 25,
      backgroundColor: "#3498db", alignItems: "center", justifyContent: "center",
      elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabAdd: {
      position: "absolute", bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
      elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
});

export default RestaurantMenuScreen;