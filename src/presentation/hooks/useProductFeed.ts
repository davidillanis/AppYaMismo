import { ProductEntity } from "@/src/domain/entities/ProductEntity";
import { useProductList } from "@/src/presentation/hooks/useProductList";
import { useEffect, useMemo, useState } from "react";

export const useProductFeed = (
  selectedRestaurantId: number | undefined,
  searchText: string,
  selectedCategory: string,
) => {
  const [page, setPage] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductEntity[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // 1. LLAMADA A LA API
  const { data, isLoading, isFetching } = useProductList({
    restaurantId: selectedRestaurantId === 0 ? undefined : selectedRestaurantId,
    page,
    size: 10,
    // CORRECCIÓN DE CAMPOS: Usamos notación de punto para asegurar que Java devuelva el nombre
    fields: [
      "id",
      "name",
      "urlImage",
      "enabled",
      "category.id",
      "category.name", // <--- ESTO ARREGLA EL "General"
      "restaurant.id",
      "restaurant.name",
      "variant.id",
      "variant.name",
      "variant.price",
      "variant.stock",
    ],
  });

  // 2. RESETEO AL CAMBIAR DE RESTAURANTE
  useEffect(() => {
    setPage(0);
    setAllProducts([]);
    setHasMore(true);
  }, [selectedRestaurantId]);

  // 3. ACUMULACIÓN DE DATOS
  useEffect(() => {
    if (data?.data?.content) {
      const newProducts = data.data.content;
      const totalPages = data.data.totalPages ?? 0;

      setAllProducts((prev) => {
        if (page === 0) return newProducts;

        // Evitar duplicados por ID
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newProducts.filter((p) => !existingIds.has(p.id));

        return [...prev, ...uniqueNew];
      });

      setHasMore(page + 1 < totalPages);
    } else if (page === 0 && data?.data) {
      // Si la primera página llega vacía
      setAllProducts([]);
      setHasMore(false);
    }
  }, [data, page]);

  // 4. FILTRADO LOCAL (Buscador + Categoría)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const q = searchText.trim().toLowerCase();
      // Safe access con Optional Chaining
      const catName = (p.category?.name ?? "").toLowerCase();
      const pName = (p.name ?? "").toLowerCase();
      const selCatLower = selectedCategory.toLowerCase();

      const matchesSearch =
        q === "" || pName.includes(q) || catName.includes(q);
      const matchesCategory =
        selectedCategory === "Todo" || catName === selCatLower;

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchText, selectedCategory]);

  // 5. OBTENER CATEGORÍAS DISPONIBLES
  const derivedCategories = useMemo(() => {
    const unique = new Set(["Todo"]);
    allProducts.forEach((p) => {
      if (p.category?.name) unique.add(p.category.name);
    });
    return Array.from(unique);
  }, [allProducts]);

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    products: filteredProducts,
    categories: derivedCategories, // Enviamos las categorías calculadas
    loadMore,
    isLoadingInitial: isLoading && page === 0,
    isLoadingMore: isFetching && page > 0,
  };
};
