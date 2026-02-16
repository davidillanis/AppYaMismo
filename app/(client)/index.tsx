import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { ProductEntity } from "@/src/domain/entities/ProductEntity";
import { CustomOrderModal } from "@/src/presentation/components/orders/CustomOrderModal";
import { ProductVariantModal } from "@/src/presentation/components/products/ProductVariantModal";

const { width } = Dimensions.get('window');

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
  onOpenCustomOrder: (type: string) => void;
}

// --- COMPONENTE HEADER (UI REDISEÑADA) ---
const HomeHeaderComponent = ({
  searchText, setSearchText,
  restaurantCategories, selectedRestCategory, onSelectRestCategory,
  filteredRestaurants, selectedRestaurantId, onSelectRestaurant,
  loadingRest, colors,
  productCategories, selectedProductCategory, onSelectProductCategory,
  selectedRestaurantName,
  onOpenCustomOrder 
}: HomeHeaderProps) => {

  const quickServices = [
    { id: 'botica', name: 'Botica', icon: 'medkit', color: '#EF4444' },
    { id: 'licores', name: 'Licores', icon: 'wine', color: '#8B5CF6' },
    { id: 'bodega', name: 'Bodega', icon: 'basket', color: '#F59E0B' },
    { id: 'mandadito', name: 'Mandadito', icon: 'bicycle', color: '#10B981' },
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.headerContent}>
      
      {/* 1. BUSCADOR ESTILO PREMIUM */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="¿Qué se te antoja hoy?"
          style={styles.searchInput}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. SERVICIOS RÁPIDOS */}
      <View style={styles.sectionMargin}>
        <Text style={styles.sectionTitle}>¿Cómo te ayudamos?</Text>
        <View style={styles.quickServicesGrid}>
          {quickServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => onOpenCustomOrder(service.name)}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconBox, { backgroundColor: service.color }]}>
                <Ionicons name={service.icon as any} size={26} color="#FFF" />
              </View>
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. CATEGORÍAS MACRO */}
      <View style={styles.sectionMargin}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={restaurantCategories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.horizontalScrollPadding}
          renderItem={({ item }) => (
            <CategoryChip
              name={item}
              isSelected={selectedRestCategory === item}
              onSelect={() => onSelectRestCategory(item)}
              colors={colors}
            />
          )}
        />
      </View>

      {/* 4. RESTAURANTES DESTACADOS */}
      <View style={styles.sectionMargin}>
        <Text style={styles.subSectionTitle}>
          {selectedRestCategory === "Todos" ? "Restaurantes Destacados" : `Locales de ${selectedRestCategory}`}
        </Text>

        {loadingRest ? (
          <ActivityIndicator color={colors.primary} style={{ height: 100 }} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredRestaurants}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.horizontalScrollPadding}
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
              <Text style={styles.emptyTextSmall}>No hay locales disponibles.</Text>
            }
          />
        )}
      </View>

      {/* 5. CARTA Y CATEGORÍAS MICRO */}
      {productCategories.length > 0 && (
        <View style={styles.productHeaderArea}>
          <View style={styles.divider} />
          <Text style={styles.menuHeadline}>
            Carta: <Text style={{ color: colors.primary }}>{selectedRestaurantName}</Text>
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={productCategories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.horizontalScrollPadding}
            renderItem={({ item }) => (
              <CategoryChip
                name={item}
                isSelected={item === selectedProductCategory}
                onSelect={() => onSelectProductCategory(item)}
                colors={colors}
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
  const [selectedRestCategory, setSelectedRestCategory] = useState("Todos");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState("Todo");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductEntity | null>(null);
  const [isCustomOrderModalVisible, setIsCustomOrderModalVisible] = useState(false);
  const [customOrderType, setCustomOrderType] = useState("");

  const { addToCart } = useCart();

  // Data
  const { data: restData, isLoading: loadingRest } = useRestaurantList({
    fields: ["id", "name", "urlImagen", "enabled", "restaurantTypes.name"],
    size: 50,
    enabled: true,
  });

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

  // FIX: El número de columnas debe estar atado a una Key única
  const numColumns = 1;

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
        {/*<SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}> */}
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <Header
            colors={colors}
            screenWidth={390}
            onMenuPress={() => setIsDrawerOpen(true)}
            onProfilePress={() => router.push("/(tabs)/ProfileUser")}
          />

          <FlatList
            key={`list-${numColumns}`} // 🔥 FIX: Evita el error Invariant Violation
            numColumns={numColumns}
            data={visibleProducts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                colors={colors}
                normalize={normalize}
                restaurantName={selectedRestaurant?.id === 0 ? item.restaurant?.name : undefined}
                onPress={(product) => {
                  setSelectedProductForModal(product);
                  setIsModalVisible(true);
                }}
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
                onSelectRestaurant={(r) => {
                  setSelectedRestaurant(r);
                  setSelectedProductCategory("Todo");
                }}
                loadingRest={loadingRest}
                colors={colors}
                productCategories={productCategories}
                selectedProductCategory={selectedProductCategory}
                onSelectProductCategory={setSelectedProductCategory}
                selectedRestaurantName={selectedRestaurant?.name === "Todos" ? "Mix Variado" : selectedRestaurant?.name}
                onOpenCustomOrder={(type) => {
                  setCustomOrderType(type);
                  setIsCustomOrderModalVisible(true);
                }}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} /> : <View style={{ height: 100 }} />}
            ListEmptyComponent={!isLoadingInitial ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={60} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No hay productos disponibles por ahora.</Text>
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
            onAddToCart={(p, v, q) => addToCart(p, v, q)}
          />

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

// --- STYLES PROFESIONALES ---
const createStyles = (colors: MappedPalette) => StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 20 },
  headerContent: { paddingTop: 10 },

  // Buscador Moderno
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, color: colors.text, fontSize: 15, fontWeight: "500" },
  filterIconButton: { padding: 4 },

  // Tipografía y Secciones
  sectionMargin: { marginTop: 24 },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: colors.text, 
    letterSpacing: -0.5, 
    marginLeft: 20, 
    marginBottom: 12 
  },
  subSectionTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.text, 
    marginLeft: 20, 
    marginBottom: 12 
  },
  horizontalScrollPadding: { paddingLeft: 20, paddingRight: 10 },

  // Servicios Rápidos (Grid)
  quickServicesGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
  serviceCard: { alignItems: 'center', width: (width - 60) / 4 },
  serviceIconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  serviceText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },

  // Carta de Productos
  productHeaderArea: { marginTop: 15, paddingBottom: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20, marginBottom: 20 },
  menuHeadline: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 10
  },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.6 },
  emptyText: { textAlign: "center", marginTop: 15, color: colors.textSecondary, fontSize: 15, fontWeight: "600" },
  emptyTextSmall: { color: colors.textSecondary, fontStyle: 'italic', marginLeft: 20 }
});

export default ClienteIndex;