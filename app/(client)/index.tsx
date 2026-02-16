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

// --- 1. COMPONENTE HEADER ---
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

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* BUSCADOR */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="¿Qué se te antoja hoy?"
          style={styles.searchInput}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* SERVICIOS RÁPIDOS */}
      <View style={styles.sectionMargin}>
        <Text style={styles.sectionTitle}>¿Cómo te ayudamos?</Text>
        <View style={styles.quickServicesGrid}>
          {quickServices.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => onOpenCustomOrder(service.name)}>
              <View style={[styles.serviceIconBox, { backgroundColor: service.color }]}>
                <Ionicons name={service.icon as any} size={26} color="#FFF" />
              </View>
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CATEGORÍAS */}
      <View style={styles.sectionMargin}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={restaurantCategories}
          keyExtractor={(item) => item}
          style={styles.horizontalListBoundary}
          renderItem={({ item }) => (
            <CategoryChip name={item} isSelected={selectedRestCategory === item} onSelect={() => onSelectRestCategory(item)} colors={colors} />
          )}
        />
      </View>

      {/* RESTAURANTES FILTRADOS */}
      <View style={styles.sectionMargin}>
        <Text style={styles.sectionTitle}>
          {selectedRestCategory === "Todos" ? "Restaurantes Destacados" : `Locales de ${selectedRestCategory}`}
        </Text>
        {loadingRest ? <ActivityIndicator color={colors.primary} /> : (
          <FlatList
            horizontal showsHorizontalScrollIndicator={false}
            data={filteredRestaurants}
            keyExtractor={(item) => String(item.id)}
            style={styles.horizontalListBoundary}
            renderItem={({ item }) => (
              <RestaurantCard
                id={item.id} name={item.name} categoria={item.restaurantTypes?.[0]?.name || "Variado"}
                urlImagen={item.urlImagen} isSelected={selectedRestaurantId === item.id}
                colors={colors} onSelect={() => onSelectRestaurant(item)}
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
            Carta: <Text style={{ color: colors.primary }}>{selectedRestaurantName}</Text>
          </Text>
          <FlatList
            horizontal showsHorizontalScrollIndicator={false}
            data={productCategories}
            keyExtractor={(item) => item}
            style={styles.horizontalListBoundary}
            renderItem={({ item }) => (
              <CategoryChip name={item} isSelected={item === selectedProductCategory} onSelect={() => onSelectProductCategory(item)} colors={colors} />
            )}
          />
        </View>
      )}
    </View>
  );
};
const HomeHeader = memo(HomeHeaderComponent);

// --- 2. COMPONENTE PRINCIPAL ---
const ClienteIndex: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const normalize = (size: number) => normalizeScreen(size, 390);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRestCategory, setSelectedRestCategory] = useState("Todos");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState("Todo");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductEntity | null>(null);
  const [isCustomOrderModalVisible, setIsCustomOrderModalVisible] = useState(false);
  const [customOrderType, setCustomOrderType] = useState("");

  const { data: restData, isLoading: loadingRest } = useRestaurantList({
    fields: ["id", "name", "urlImagen", "enabled", "restaurantTypes.name"],
    size: 50, enabled: true,
  });

  const rawActiveRestaurants = useMemo(() => restData?.data?.content?.filter((r: any) => r.enabled === true) || [], [restData]);

  const restaurantCategories = useMemo(() => {
    const types = new Set<string>();
    types.add("Todos");
    rawActiveRestaurants.forEach((r: any) => {
      const typeName = r.restaurantTypes?.[0]?.name;
      if (typeName) types.add(typeName);
    });
    return Array.from(types);
  }, [rawActiveRestaurants]);

  // 🔥 CORRECCIÓN: Restringimos la aparición de "Todos" en la sub-lista
  const filteredRestaurants = useMemo(() => {
    const list = rawActiveRestaurants.filter((r: any) =>
      selectedRestCategory === "Todos" || r.restaurantTypes?.[0]?.name === selectedRestCategory
    );
    
    // Solo agregamos el chip "Todos" si NO hemos escogido una categoría específica
    if (selectedRestCategory === "Todos") {
      return [{ id: 0, name: "Todos", urlImagen: "" }, ...list];
    }
    
    return list; // Si eligió "Café", solo mostramos las cafeterías reales
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

  return (
    <>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Drawer
        open={isDrawerOpen} onOpen={() => setIsDrawerOpen(true)} onClose={() => setIsDrawerOpen(false)}
        renderDrawerContent={() => (
          <DrawerMenu
            colors={colors} user={user} screenWidth={390} authority="Cliente"
            menuItems={user ? [{ icon: "person-outline", title: "Mi perfil", route: "/ProfileUser" }, { icon: "receipt-outline", title: "Mis Pedidos", route: "/OrderHistoryClient" }] : [{ icon: "log-in-outline", title: "Iniciar Sesión", route: "/(auth)/login" }]}
            onNavigate={(r: string) => { router.push(r as any); setIsDrawerOpen(false); }}
            onLogout={logout}
          />
        )}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Header colors={colors} screenWidth={390} onMenuPress={() => setIsDrawerOpen(true)} onProfilePress={() => router.push("/(tabs)/ProfileUser")} />

          <FlatList
            data={visibleProducts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductCard
                product={item} colors={colors} normalize={normalize}
                restaurantName={selectedRestaurant?.id === 0 ? item.restaurant?.name : undefined}
                onPress={(product) => { setSelectedProductForModal(product); setIsModalVisible(true); }}
              />
            )}
            ListHeaderComponent={
              <HomeHeader
                searchText={searchText} setSearchText={setSearchText}
                restaurantCategories={restaurantCategories} selectedRestCategory={selectedRestCategory}
                onSelectRestCategory={setSelectedRestCategory} filteredRestaurants={filteredRestaurants}
                selectedRestaurantId={selectedRestaurant?.id} 
                onSelectRestaurant={(r: any) => { setSelectedRestaurant(r); setSelectedProductCategory("Todo"); }}
                loadingRest={loadingRest} colors={colors} productCategories={productCategories}
                selectedProductCategory={selectedProductCategory} onSelectProductCategory={setSelectedProductCategory}
                selectedRestaurantName={selectedRestaurant?.name === "Todos" ? "Mix Variado" : selectedRestaurant?.name}
                onOpenCustomOrder={(type: string) => { setCustomOrderType(type); setIsCustomOrderModalVisible(true); }}
              />
            }
            onEndReached={loadMore}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : <View style={{ height: 20 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <CartFab colors={colors} />
          <ProductVariantModal visible={isModalVisible} product={selectedProductForModal} colors={colors} onClose={() => setIsModalVisible(false)} onAddToCart={addToCart} />
          <CustomOrderModal visible={isCustomOrderModalVisible} onClose={() => setIsCustomOrderModalVisible(false)} serviceType={customOrderType} colors={colors} />
        </SafeAreaView>
      </Drawer>
    </>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: '#FFF', borderRadius: 16, 
    paddingHorizontal: 16, height: 52, marginHorizontal: 20, marginTop: 10,
    borderWidth: 1, borderColor: '#EEE', elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: "500", color: '#000' },
  sectionMargin: { marginTop: 24, marginHorizontal: 20 },
  menuSectionMargin: { marginTop: 24, marginHorizontal: 20, marginBottom: 16 }, 
  sectionTitle: { fontSize: 20, fontWeight: "800", color: '#000', letterSpacing: -0.5, marginBottom: 12 },
  horizontalListBoundary: { overflow: 'hidden' },
  quickServicesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceCard: { alignItems: 'center', width: (width - 80) / 4 },
  serviceIconBox: { width: 58, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 4 },
  serviceText: { fontSize: 11, fontWeight: '700', color: '#666', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 20 },
  menuHeadline: { fontSize: 13, fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
});

export default ClienteIndex;