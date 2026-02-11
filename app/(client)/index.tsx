import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView } from "react-native-safe-area-context";

// Config y Contextos
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
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

// Modal
import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/ProductEntity";
import { ProductVariantModal } from "@/src/presentation/components/products/ProductVariantModal";

const ClienteIndex: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user, logout } = useAuth();
  const normalize = (size: number) => normalizeScreen(size, 390);
  const styles = createStyles(colors, normalize);

  // --- ESTADOS ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todo");
  const [searchText, setSearchText] = useState("");

  // --- ESTADOS PARA EL MODAL DE VARIANTES ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductEntity | null>(null);

  // --- CONTEXTO CARRITO ---
  const { addToCart } = useCart();

  // --- DATOS 1: RESTAURANTES ---
  const { data: restData, isLoading: loadingRest } = useRestaurantList({
    fields: [
        "id", 
        "name", 
        "urlImagen", 
        "enabled",        // <--- Importante: Aseguramos pedir este campo
        "restaurantTypes.name", 
        "products.name",
        "products.description",
        "products.urlImage",
        "products.enabled",      
        "products.variant.id",    
        "products.variant.name",  
        "products.variant.price", 
        "products.variant.stock"
    ],
    size: 50,
    enabled: true, // 1. Solicitamos solo activos al Backend
  });
  const restaurantListRef = React.useRef<FlatList>(null);

  const restaurants = React.useMemo(() => {
    const apiRest = restData?.data?.content || [];
    
    // 🔥 2. FILTRO DE SEGURIDAD (Client-Side Fallback)
    // Filtramos explícitamente los que tengan enabled === true para limpiar la lista
    // por si el backend ignora el parámetro.
    const activeRest = apiRest.filter((r: any) => r.enabled === true);

    return [{ id: 0, name: "Todos", urlImagen: "" }, ...activeRest];
  }, [restData]);

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [restaurants]);

  // --- DATOS 2: PRODUCTOS ---
  const { products, categories, loadMore, isLoadingInitial, isLoadingMore } =
    useProductFeed(selectedRestaurant?.id, searchText, selectedCategory);

  // 🔥 3. FILTRO DE PRODUCTOS ACTIVOS
  const visibleProducts = React.useMemo(() => {
    //return products.filter((p) => p.enabled !== false);
    const activeRestaurantIds = new Set(
      restaurants
      .filter(r => r.id !== 0 )
      .map(r => r.id)
    );

    return products.filter((p) => {
      const isProductEnabled = p.enabled !== false;

      const isRentauranteActive = p.restaurant?.id
      ? activeRestaurantIds.has(p.restaurant.id)
      : true; // Si no tiene restaurante, lo consideramos activo (o lo manejamos según tu lógica)

      return isProductEnabled && isRentauranteActive;

    })
  }, [products, restaurants]);

  // --- HANDLERS ---
  const handleSelectRestaurant = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setSelectedCategory("Todo");
    
    // Scroll suave al seleccionar
    const index = restaurants.findIndex((r) => r.id === restaurant.id);
    if (index !== -1) {
      // Pequeño timeout para asegurar que la lista esté lista si cambia muy rápido
      setTimeout(() => {
          restaurantListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }, 100);
    }
  };

  const handleProductPress = (product: ProductEntity) => {
    setSelectedProductForModal(product);
    setIsModalVisible(true);
  };

  const handleAddToCartFromModal = (product: ProductEntity, variant: ProductVariantEntity, quantity: number) => {
    addToCart(product, variant, quantity);
  };

  // --- RENDER HEADER ---
  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#0F172A" />
        <TextInput
          placeholder="Buscar plato..."
          style={styles.searchInput}
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={{ marginVertical: 8 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryChip
              name={item}
              isSelected={item === selectedCategory}
              onSelect={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      </View>

      <Text style={styles.sectionTitle}>Restaurantes</Text>
      {loadingRest ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          ref={restaurantListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={restaurants}
          keyExtractor={(item) => String(item.id)}
          // Evita errores de scroll si la lista cambia dinámicamente
          onScrollToIndexFailed={(info) => {
             const wait = new Promise(resolve => setTimeout(resolve, 500));
             wait.then(() => {
               restaurantListRef.current?.scrollToIndex({ index: info.index, animated: true });
             });
          }}
          renderItem={({ item }) => (
            <RestaurantCard
              id={item.id}
              name={item.name}
              urlImagen={item.urlImagen}
              isSelected={selectedRestaurant?.id === item.id}
              colors={colors}
              onSelect={() => handleSelectRestaurant(item)}
            />
          )}
        />
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        Menú de: {selectedRestaurant?.name ?? "Seleccione..."}
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary} />
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
              { icon: "person-outline", title: "Mi perfil", route: "/PerfilAdmi" },
              { icon: "receipt-outline", title: "Mis Pedidos", route: "/OrderHistoryClient" },
            ]}
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

          {renderHeader()}

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
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : <View style={{ height: 100 }} />}
            ListEmptyComponent={!isLoadingInitial ? <Text style={styles.emptyText}>No hay productos disponibles.</Text> : null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          <CartFab colors={colors} />

          <ProductVariantModal
            visible={isModalVisible}
            product={selectedProductForModal}
            colors={colors}
            onClose={() => setIsModalVisible(false)}
            onAddToCart={handleAddToCartFromModal}
          />
        </SafeAreaView>
      </Drawer>
    </>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
  StyleSheet.create({
    container: { flex: 1 },
    listContent: { paddingHorizontal: 15 },
    headerContent: { paddingTop: 6, paddingHorizontal: 15 },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#eee",
      elevation: 1,
    },
    searchInput: { flex: 1, marginLeft: 6, color: "#000", paddingVertical: 2, fontSize: 13 },
    sectionTitle: { fontSize: normalize(18), fontWeight: "bold", color: colors.text, marginBottom: 10 },
    emptyText: { textAlign: "center", marginTop: 50, color: colors.textSecondary, fontStyle: "italic" },
  });

export default ClienteIndex;