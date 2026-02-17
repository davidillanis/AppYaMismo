import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
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

const { width } = Dimensions.get("window");

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

// ====== OPTIMIZACIÓN #1: Extraer datos estáticos fuera del componente ======
// PROBLEMA: Se recreaba el array quickServices en cada render causando re-renders innecesarios
// SOLUCIÓN: Definirlo como constante fuera del componente
const QUICK_SERVICES = [
  { id: "botica", name: "Botica", icon: "medkit", color: "#EF4444" },
  { id: "licores", name: "Licores", icon: "wine", color: "#8B5CF6" },
  { id: "bodega", name: "Bodega", icon: "basket", color: "#F59E0B" },
  { id: "mandadito", name: "Mandadito", icon: "bicycle", color: "#10B981" },
] as const;

// ====== OPTIMIZACIÓN #2: Componente renderItem memoizado para FlatList ======
// PROBLEMA: Las funciones inline en renderItem causan re-renders de cada item al re-renderizar el padre
// SOLUCIÓN: Crear componente memoizado reutilizable
const CategoryChipRenderItem = memo(
  ({
    item,
    isSelected,
    onSelect,
    colors,
  }: {
    item: string;
    isSelected: boolean;
    onSelect: (item: string) => void;
    colors: MappedPalette;
  }) => (
    <CategoryChip
      name={item}
      isSelected={isSelected}
      onSelect={() => onSelect(item)}
      colors={colors}
    />
  ),
);
CategoryChipRenderItem.displayName = "CategoryChipRenderItem";

// ====== OPTIMIZACIÓN #3: Componente renderItem memoizado para Restaurantes ======
const RestaurantCardRenderItem = memo(
  ({
    item,
    isSelected,
    onSelect,
    colors,
  }: {
    item: any;
    isSelected: boolean;
    onSelect: (item: any) => void;
    colors: MappedPalette;
  }) => (
    <RestaurantCard
      id={item.id}
      name={item.name}
      categoria={item.restaurantTypes?.[0]?.name || "Variado"}
      urlImagen={item.urlImagen}
      isSelected={isSelected}
      colors={colors}
      onSelect={() => onSelect(item)}
    />
  ),
);
RestaurantCardRenderItem.displayName = "RestaurantCardRenderItem";

// ====== OPTIMIZACIÓN #4: Componente renderItem memoizado para Servicios Rápidos ======
const ServiceCardItem = memo(
  ({
    service,
    onPress,
  }: {
    service: (typeof QUICK_SERVICES)[number];
    onPress: (name: string) => void;
  }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onPress(service.name)}
      activeOpacity={0.7}
    >
      <View style={[styles.serviceIconBox, { backgroundColor: service.color }]}>
        <Ionicons name={service.icon as any} size={26} color="#FFF" />
      </View>
      <Text style={styles.serviceText}>{service.name}</Text>
    </TouchableOpacity>
  ),
);
ServiceCardItem.displayName = "ServiceCardItem";

// --- 1. COMPONENTE HEADER ---
const HomeHeaderComponent = ({
  searchText,
  setSearchText,
  restaurantCategories,
  selectedRestCategory,
  onSelectRestCategory,
  filteredRestaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  loadingRest,
  colors,
  productCategories,
  selectedProductCategory,
  onSelectProductCategory,
  selectedRestaurantName,
  onOpenCustomOrder,
}: HomeHeaderProps) => {
  // ====== OPTIMIZACIÓN #5: useCallback para evitar recrear funciones en cada render ======
  // PROBLEMA: onSelectRestCategory se recreaba causando re-renders innecesarios en CategoryChip
  // SOLUCIÓN: Memoizar la función callback
  const handleSelectRestCategory = useCallback(
    (category: string) => {
      onSelectRestCategory(category);
    },
    [onSelectRestCategory],
  );

  const handleSelectProductCategory = useCallback(
    (category: string) => {
      onSelectProductCategory(category);
    },
    [onSelectProductCategory],
  );

  const handleSelectRestaurant = useCallback(
    (item: any) => {
      onSelectRestaurant(item);
    },
    [onSelectRestaurant],
  );

  const handleOpenCustomOrder = useCallback(
    (serviceName: string) => {
      onOpenCustomOrder(serviceName);
    },
    [onOpenCustomOrder],
  );

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* BUSCADOR */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          placeholder="¿Qué se te antoja hoy?"
          style={styles.searchInput}
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          // ====== OPTIMIZACIÓN #6: Reducir actualizaciones innecesarias en búsqueda ======
          // throttleTime no está disponible en TextInput nativo, pero useCallback en el padre ayuda
        />
      </View>

      {/* SERVICIOS RÁPIDOS */}
      <View style={styles.sectionMargin}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>¿Cómo te ayudamos?</Text>
        <View style={styles.quickServicesGrid}>
          {QUICK_SERVICES.map((service) => (
            <ServiceCardItem
              key={service.id}
              service={service}
              onPress={handleOpenCustomOrder}
            />
          ))}
        </View>
      </View>

      {/* CATEGORÍAS */}
      <View style={styles.sectionMargin}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorias</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={restaurantCategories}
          keyExtractor={(item, index) => `cat-rest-${item}-${index}`}
          style={styles.horizontalListBoundary}
          // ====== OPTIMIZACIÓN #7: Usar removeClippedSubviews para mejorar rendimiento ======
          removeClippedSubviews={true}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
          renderItem={({ item }) => (
            <CategoryChipRenderItem
              item={item}
              isSelected={selectedRestCategory === item}
              onSelect={handleSelectRestCategory}
              colors={colors}
            />
          )}
        />
      </View>

      {/* RESTAURANTES FILTRADOS */}
      <View style={styles.sectionMargin}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedRestCategory === "Todos"
            ? "Restaurantes Disponibles"
            : `Locales de ${selectedRestCategory}`}
        </Text>
        {loadingRest ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredRestaurants}
            keyExtractor={(item, index) => `rest-${item.id}-${index}`}
            style={styles.horizontalListBoundary}
            // ====== OPTIMIZACIÓN #7: Usar removeClippedSubviews para mejorar rendimiento ======
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            renderItem={({ item }) => (
              <RestaurantCardRenderItem
                item={item}
                isSelected={selectedRestaurantId === item.id}
                onSelect={handleSelectRestaurant}
                colors={colors}
              />
            )}
          />
        )}
      </View>

      {/* CARTA DE PRODUCTOS */}
      {productCategories.length > 0 && (
        <View style={styles.menuSectionMargin}>
          <View style={styles.divider} />
          <Text style={styles.menuHeadline}>
            Carta:{" "}
            <Text style={{ color: colors.primary }}>
              {selectedRestaurantName}
            </Text>
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={productCategories}
            keyExtractor={(item, index) => `cat-prod-${item}-${index}`}
            style={styles.horizontalListBoundary}
            // ====== OPTIMIZACIÓN #7: Usar removeClippedSubviews para mejorar rendimiento ======
            removeClippedSubviews={true}
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={50}
            renderItem={({ item }) => (
              <CategoryChipRenderItem
                item={item}
                isSelected={item === selectedProductCategory}
                onSelect={handleSelectProductCategory}
                colors={colors}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

// ====== OPTIMIZACIÓN #8: Memoizar componente Header para evitar re-renders innecesarios ======
const HomeHeader = memo(HomeHeaderComponent, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders si props no cambian
  return (
    prevProps.searchText === nextProps.searchText &&
    prevProps.selectedRestCategory === nextProps.selectedRestCategory &&
    prevProps.selectedRestaurantId === nextProps.selectedRestaurantId &&
    prevProps.selectedProductCategory === nextProps.selectedProductCategory &&
    prevProps.loadingRest === nextProps.loadingRest &&
    prevProps.restaurantCategories === nextProps.restaurantCategories &&
    prevProps.filteredRestaurants === nextProps.filteredRestaurants &&
    prevProps.productCategories === nextProps.productCategories &&
    prevProps.selectedRestaurantName === nextProps.selectedRestaurantName
  );
});
HomeHeader.displayName = "HomeHeader";

// --- 2. COMPONENTE PRINCIPAL ---
const ClienteIndex: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart } = useCart();

  // ====== OPTIMIZACIÓN #9: Memoizar normalize para evitar recálculos ======
  const normalize = useCallback(
    (size: number) => normalizeScreen(size, 390),
    [],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRestCategory, setSelectedRestCategory] = useState("Todos");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedProductCategory, setSelectedProductCategory] =
    useState("Todo");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<ProductEntity | null>(null);
  const [isCustomOrderModalVisible, setIsCustomOrderModalVisible] =
    useState(false);
  const [customOrderType, setCustomOrderType] = useState("");

  const { data: restData, isLoading: loadingRest } = useRestaurantList({
    fields: ["id", "name", "urlImagen", "enabled", "restaurantTypes.name"],
    size: 50,
    enabled: true,
  });

  const rawActiveRestaurants = useMemo(
    () => restData?.data?.content?.filter((r: any) => r.enabled === true) || [],
    [restData],
  );

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
    const list = rawActiveRestaurants.filter(
      (r: any) =>
        selectedRestCategory === "Todos" ||
        r.restaurantTypes?.[0]?.name === selectedRestCategory,
    );

    if (selectedRestCategory === "Todos") {
      const cleanList = list.filter((r) => r.id !== 0);
      return [
        { id: 0, name: "Todos", urlImagen: "", restaurantTypes: [] },
        ...cleanList,
      ];
    }

    return list;
  }, [selectedRestCategory, rawActiveRestaurants]);

  useEffect(() => {
    if (filteredRestaurants.length > 0) {
      const isValid = filteredRestaurants.find(
        (r) => r.id === selectedRestaurant?.id,
      );
      if (!isValid) setSelectedRestaurant(filteredRestaurants[0]);
    }
  }, [selectedRestCategory, filteredRestaurants]);

  const {
    products,
    categories: productCategories,
    loadMore,
    isLoadingInitial,
    isLoadingMore,
  } = useProductFeed(
    selectedRestaurant?.id,
    searchText,
    selectedProductCategory,
  );

  const visibleProducts = useMemo(() => {
    if (selectedRestaurant?.id === 0 && selectedRestCategory !== "Todos") {
      return products.filter(
        (p) =>
          p.restaurant?.restaurantTypes?.[0]?.name === selectedRestCategory,
      );
    }
    return products;
  }, [products, selectedRestCategory, selectedRestaurant]);

  // ====== OPTIMIZACIÓN #10: Memoizar callbacks para evitar re-renders en componentes hijos ======
  const handleSelectRestCategory = useCallback((cat: string) => {
    setSelectedRestCategory(cat);
  }, []);

  const handleSelectRestaurant = useCallback((r: any) => {
    setSelectedRestaurant(r);
    setSelectedProductCategory("Todo");
  }, []);

  const handleSelectProductCategory = useCallback((cat: string) => {
    setSelectedProductCategory(cat);
  }, []);

  const handleOpenCustomOrder = useCallback((type: string) => {
    setCustomOrderType(type);
    setIsCustomOrderModalVisible(true);
  }, []);

  const handleSetSearchText = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleMenuPress = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push("/(tabs)/ProfileUser");
  }, [router]);

  const handleDrawerNavigate = useCallback(
    (route: string) => {
      router.push(route as any);
      setIsDrawerOpen(false);
    },
    [router],
  );

  const handleProductPress = useCallback((product: ProductEntity) => {
    setSelectedProductForModal(product);
    setIsModalVisible(true);
  }, []);

  // ====== OPTIMIZACIÓN #11: Memoizar ListHeaderComponent para evitar recreación ======
  const headerComponent = useMemo(
    () => (
      <HomeHeader
        searchText={searchText}
        setSearchText={handleSetSearchText}
        restaurantCategories={restaurantCategories}
        selectedRestCategory={selectedRestCategory}
        onSelectRestCategory={handleSelectRestCategory}
        filteredRestaurants={filteredRestaurants}
        selectedRestaurantId={selectedRestaurant?.id}
        onSelectRestaurant={handleSelectRestaurant}
        loadingRest={loadingRest}
        colors={colors}
        productCategories={productCategories}
        selectedProductCategory={selectedProductCategory}
        onSelectProductCategory={handleSelectProductCategory}
        selectedRestaurantName={
          selectedRestaurant?.name === "Todos"
            ? "Mix Variado"
            : selectedRestaurant?.name
        }
        onOpenCustomOrder={handleOpenCustomOrder}
      />
    ),
    [
      searchText,
      restaurantCategories,
      selectedRestCategory,
      filteredRestaurants,
      selectedRestaurant?.id,
      selectedRestaurant?.name,
      loadingRest,
      colors,
      productCategories,
      selectedProductCategory,
      handleSetSearchText,
      handleSelectRestCategory,
      handleSelectRestaurant,
      handleSelectProductCategory,
      handleOpenCustomOrder,
    ],
  );

  // ====== OPTIMIZACIÓN #12: Memoizar Footer para evitar recreación ======
  const footerComponent = useMemo(
    () =>
      isLoadingMore ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={{ height: 20 }} />
      ),
    [isLoadingMore, colors.primary],
  );

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Drawer
        open={isDrawerOpen}
        onOpen={() => setIsDrawerOpen(true)}
        onClose={() => setIsDrawerOpen(false)}
        renderDrawerContent={() => (
          <DrawerMenu
            colors={colors}
            user={user}
            screenWidth={390}
            authority="Cliente"
            menuItems={
              user
                ? [
                    {
                      icon: "person-outline",
                      title: "Mi perfil",
                      route: "/ProfileUser",
                    },
                    {
                      icon: "receipt-outline",
                      title: "Mis Pedidos",
                      route: "/OrderHistoryClient",
                    },
                  ]
                : [
                    {
                      icon: "log-in-outline",
                      title: "Iniciar Sesión",
                      route: "/(auth)/login",
                    },
                  ]
            }
            onNavigate={handleDrawerNavigate}
            onLogout={logout}
          />
        )}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Header
            colors={colors}
            screenWidth={390}
            onMenuPress={handleMenuPress}
            onProfilePress={handleProfilePress}
          />

          <FlatList
            data={visibleProducts}
            keyExtractor={(item, index) => `prod-${item.id}-${index}`}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                colors={colors}
                normalize={normalize}
                restaurantName={
                  selectedRestaurant?.id === 0
                    ? item.restaurant?.name
                    : undefined
                }
                onPress={handleProductPress}
              />
            )}
            ListHeaderComponent={headerComponent}
            onEndReached={loadMore}
            ListFooterComponent={footerComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            // ====== OPTIMIZACIÓN #13: Optimizar FlatList principal ======
            // Mejora significativa en rendimiento de scroll
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
          />

          <CartFab colors={colors} />
          <ProductVariantModal
            visible={isModalVisible}
            product={selectedProductForModal}
            colors={colors}
            onClose={() => setIsModalVisible(false)}
            onAddToCart={addToCart}
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

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  sectionMargin: {
    marginTop: 28,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },

  menuSectionMargin: {
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 14,
  },

  horizontalListBoundary: {
    overflow: "visible",
  },

  quickServicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  serviceCard: {
    alignItems: "center",
    width: (width - 100) / 4,
  },

  serviceIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  serviceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 24,
  },

  menuHeadline: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
});

export default ClienteIndex;
