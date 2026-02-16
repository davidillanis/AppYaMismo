import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Importante para los botones
  View,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView } from "react-native-safe-area-context";

// Config y Contextos
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MappedPalette } from "@/src/domain/types/MappedPalette";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useCart } from "@/src/presentation/context/CartContext";

// Hooks
import { useProductFeed } from "@/src/presentation/hooks/useProductFeed";
import { useRestaurantList } from "@/src/presentation/hooks/useRestaurantList";

// Componentes
import { ProductCard } from "@/src/presentation/components/cards/ProductCard";
import { RestaurantCard } from "@/src/presentation/components/cards/RestaurantCard";
import { CartFab } from "@/src/presentation/components/cart/CartFab";
import { CategoryChip } from "@/src/presentation/components/filters/CategoryChip";
import DrawerMenu from "../../components/widgets/DrawerMenu";
import Header from "../../components/widgets/Header";

// Modales
import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/ProductEntity";
import { CustomOrderModal } from "@/src/presentation/components/orders/CustomOrderModal"; // 🔥 1. IMPORTAR MODAL
import { ProductVariantModal } from "@/src/presentation/components/products/ProductVariantModal";

// --- INTERFAZ PROPS DEL HEADER ---
interface HomeHeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  restaurantCategories: string[];
  selectedRestCategory: string;
  onSelectRestCategory: (cat: string) => void;
  filteredRestaurants: any[];
  selectedRestaurantId: number | undefined;
  onSelectRestaurant: (item: any) => void;
  loadingRest: boolean;
  colors: MappedPalette;
  productCategories: string[];
  selectedProductCategory: string;
  onSelectProductCategory: (cat: string) => void;
  selectedRestaurantName: string;
  onOpenCustomOrder: (type: string) => void; // 🔥 2. NUEVO PROP
}

// --- COMPONENTE HEADER ---
const HomeHeaderComponent = ({
  searchText, setSearchText,
  restaurantCategories, selectedRestCategory, onSelectRestCategory,
  filteredRestaurants, selectedRestaurantId, onSelectRestaurant,
  loadingRest, colors,
  productCategories, selectedProductCategory, onSelectProductCategory,
  selectedRestaurantName,
  onOpenCustomOrder // Recibimos la función
}: HomeHeaderProps) => {

  // 🔥 3. DEFINIR SERVICIOS RÁPIDOS
  const quickServices = [
    { id: 'botica', name: 'Botica', icon: 'medkit', color: colors.error },
    { id: 'licores', name: 'Licores', icon: 'wine', color: colors.secondary },
    { id: 'bodega', name: 'Bodega', icon: 'basket', color: colors.warning },
    { id: 'mandadito', name: 'Mandadito', icon: 'bicycle', color: colors.success },
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.headerContent}>

      {/* A. BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="¿Qué se te antoja hoy?"
          style={styles.searchInput}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 🔥 B. NUEVA SECCIÓN: BOTONES RÁPIDOS */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>¿Qué necesitas?</Text>
        <View style={styles.quickServicesGrid}>
          {quickServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => onOpenCustomOrder(service.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBox, { backgroundColor: service.color + '10' }]}>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* C. FILTRO MACRO (Categorías Restaurante) */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={restaurantCategories}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingVertical: 10, paddingRight: 20 }}
          renderItem={({ item }) => (
            <CategoryChip
              name={item}
              isSelected={selectedRestCategory === item}
              onSelect={() => onSelectRestCategory(item)}
            />
          )}
        />
      </View>

      {/* D. LISTA DE RESTAURANTES */}
      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.subSectionTitle}>
            {selectedRestCategory === "Todos" ? "Restaurantes Destacados" : `Locales de ${selectedRestCategory}`}
          </Text>
        </View>

        {loadingRest ? (
          <ActivityIndicator color={colors.primary} style={{ height: 100 }} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredRestaurants}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <RestaurantCard
                id={item.id}
                name={item.name}
                categoria={item.restaurantTypes?.[0]?.name || "Variado"}
                urlImagen={item.urlImagen}
                isSelected={selectedRestaurantId === item.id}
                colors={colors}
                onSelect={() => onSelectRestaurant(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', padding: 10 }}>
                No hay locales disponibles.
              </Text>
            }
          />
        )}
      </View>

      {/* E. FILTRO MICRO (Productos) */}
      {productCategories.length > 0 && (
        <View style={{ marginTop: 20, marginBottom: 10 }}>
          <Text style={styles.subSectionTitle}>
            Carta: {selectedRestaurantName}
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={productCategories}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingRight: 20, paddingTop: 5, paddingBottom: 5 }}
            renderItem={({ item }) => (
              <CategoryChip
                name={item}
                isSelected={item === selectedProductCategory}
                onSelect={() => onSelectProductCategory(item)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

const HomeHeader = memo(HomeHeaderComponent);

// --- COMPONENTE PRINCIPAL ---
const ClienteIndex: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user, logout } = useAuth();
  const normalize = (size: number) => normalizeScreen(size, 390);

  // Estados
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Filtros
  const [selectedRestCategory, setSelectedRestCategory] = useState("Todos");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState("Todo");

  // Modales
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductEntity | null>(null);

  // 🔥 4. ESTADOS PARA MODAL MANDADITOS
  const [isCustomOrderModalVisible, setIsCustomOrderModalVisible] = useState(false);
  const [customOrderType, setCustomOrderType] = useState("");

  const { addToCart } = useCart();

  // Data
  const { data: restData, isLoading: loadingRest } = useRestaurantList({
    fields: ["id", "name", "urlImagen", "enabled", "restaurantTypes.name"],
    size: 50,
    enabled: true,
  });

  // Lógica de Filtros (Igual que antes)
  const rawActiveRestaurants = useMemo(() => {
    return restData?.data?.content?.filter((r: any) => r.enabled === true) || [];
  }, [restData]);

  const restaurantCategories = useMemo(() => {
    const types = new Set<string>();
    types.add("Todos");
    rawActiveRestaurants.forEach((r: any) => {
      const typeName = r.restaurantTypes?.[0]?.name;
      if (typeName) types.add(typeName);
    });
    return Array.from(types);
  }, [rawActiveRestaurants]);

  const filteredRestaurants = useMemo(() => {
    if (selectedRestCategory === "Todos") {
      return [{ id: 0, name: "Todos", urlImagen: "" }, ...rawActiveRestaurants];
    }
    return rawActiveRestaurants.filter((r: any) =>
      r.restaurantTypes?.[0]?.name === selectedRestCategory
    );
  }, [selectedRestCategory, rawActiveRestaurants]);

  useEffect(() => {
    if (filteredRestaurants.length > 0) {
      const isValid = filteredRestaurants.find(r => r.id === selectedRestaurant?.id);
      if (!isValid) setSelectedRestaurant(filteredRestaurants[0]);
    }
  }, [selectedRestCategory, filteredRestaurants]);

  const { products, categories: productCategories, loadMore, isLoadingInitial, isLoadingMore } =
    useProductFeed(selectedRestaurant?.id, searchText, selectedProductCategory);

  const visibleProducts = useMemo(() => {
    if (selectedRestaurant?.id === 0 && selectedRestCategory !== "Todos") {
      return products.filter(p => p.restaurant?.restaurantTypes?.[0]?.name === selectedRestCategory);
    }
    return products;
  }, [products, selectedRestCategory, selectedRestaurant]);

  // Handlers
  const handleSelectRestaurant = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setSelectedProductCategory("Todo");
  };

  const handleProductPress = (product: ProductEntity) => {
    setSelectedProductForModal(product);
    setIsModalVisible(true);
  };

  const handleAddToCartFromModal = (product: ProductEntity, variant: ProductVariantEntity, quantity: number) => {
    addToCart(product, variant, quantity);
  };

  // 🔥 5. HANDLER PARA ABRIR MODAL
  const handleOpenCustomOrder = (type: string) => {
    setCustomOrderType(type);
    setIsCustomOrderModalVisible(true);
  };

  return (
    <>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
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
            menuItems={
              user
                ? [
                  { icon: "person-outline", title: "Mi perfil", route: "/ProfileUser" },
                  { icon: "receipt-outline", title: "Mis Pedidos", route: "/OrderHistoryClient" },
                ]
                : [
                  { icon: "log-in-outline", title: "Iniciar Sesión", route: "/(auth)/login" },
                ]
            }
            onNavigate={(r) => { router.push(r as any); setIsDrawerOpen(false); }}
            onLogout={logout}
          />
        )}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <Header
            colors={colors}
            screenWidth={390}
            onMenuPress={() => setIsDrawerOpen(true)}
            onProfilePress={() => router.push("/(tabs)/ProfileUser")}
          />

          <FlatList
            data={visibleProducts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                colors={colors}
                normalize={normalize}
                restaurantName={selectedRestaurant?.id === 0 ? item.restaurant?.name : undefined}
                onPress={handleProductPress}
              />
            )}
            ListHeaderComponent={
              <HomeHeader
                searchText={searchText}
                setSearchText={setSearchText}
                restaurantCategories={restaurantCategories}
                selectedRestCategory={selectedRestCategory}
                onSelectRestCategory={setSelectedRestCategory}
                filteredRestaurants={filteredRestaurants}
                selectedRestaurantId={selectedRestaurant?.id}
                onSelectRestaurant={handleSelectRestaurant}
                loadingRest={loadingRest}
                colors={colors}
                productCategories={productCategories}
                selectedProductCategory={selectedProductCategory}
                onSelectProductCategory={setSelectedProductCategory}
                selectedRestaurantName={selectedRestaurant?.name === "Todos" ? "Mix Variado" : selectedRestaurant?.name}
                onOpenCustomOrder={handleOpenCustomOrder} // 🔥 PASAMOS LA FUNCIÓN
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} /> : <View style={{ height: 100 }} />}
            ListEmptyComponent={!isLoadingInitial ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No hay productos disponibles.</Text>
              </View>
            ) : null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />

          <CartFab colors={colors} />

          <ProductVariantModal
            visible={isModalVisible}
            product={selectedProductForModal}
            colors={colors}
            onClose={() => setIsModalVisible(false)}
            onAddToCart={handleAddToCartFromModal}
          />

          {/* 🔥 6. RENDERIZAR MODAL MANDADITOS */}
          <CustomOrderModal
            visible={isCustomOrderModalVisible}
            onClose={() => setIsCustomOrderModalVisible(false)}
            serviceType={customOrderType}
            colors={colors}
          />

        </SafeAreaView>
      </Drawer>
    </>
  );
};

const createStyles = (colors: MappedPalette) => StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 20 },
  headerContent: { paddingHorizontal: 16, paddingTop: 10 },

  // Buscador
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, color: colors.text, fontSize: 14, fontWeight: "500" },

  // Títulos
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  subSectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  // 🔥 Estilos Grid Servicios
  quickServicesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  serviceCard: { alignItems: 'center', width: '23%' },
  serviceIconBox: {
    width: 58, height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6
  },
  serviceText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: "center", marginTop: 10, color: colors.textTertiary, fontSize: 14, fontWeight: "500" },
});

export default ClienteIndex;