import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/ProductEntity"; // <--- Ajusta la ruta si tus entidades están en otro lado
import React, { createContext, useContext, useState } from "react";

// 1. Definimos la estructura del Item en el carrito
export interface CartItem {
  uniqueId: string; // ID único: "prodId-variantId"
  product: ProductEntity;
  variant: ProductVariantEntity;
  quantity: number;
  total: number;
}

// 2. Definimos qué funciones y datos expone el Contexto
interface CartContextType {
  cartItems: CartItem[];
  // 👇 AQUÍ ESTÁ LA CORRECCIÓN: Ahora aceptamos 3 argumentos
  addToCart: (product: ProductEntity, variant: ProductVariantEntity, quantity: number) => void;
  removeFromCart: (uniqueId: string) => void;
  decreaseQuantity: (uniqueId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, variantId?: number) => number;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- FUNCIÓN AGREGAR (ACTUALIZADA) ---
  const addToCart = (product: ProductEntity, variant: ProductVariantEntity, quantity: number) => {
    // Creamos un ID único combinando producto y variante
    const uniqueId = `${product.id}-${variant.id}`;

    setCartItems((prevItems) => {
      // Buscamos si ya existe EXACTAMENTE esta combinación
      const existingItemIndex = prevItems.findIndex((item) => item.uniqueId === uniqueId);

      if (existingItemIndex >= 0) {
        // SI YA EXISTE: Actualizamos la cantidad y el total
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        
        const newQuantity = currentItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: newQuantity,
          total: newQuantity * variant.price, // Recalculamos total con precio de variante
        };
        return updatedItems;
      } else {
        // SI ES NUEVO: Lo agregamos al array
        const newItem: CartItem = {
          uniqueId,
          product,
          variant,
          quantity,
          total: quantity * variant.price,
        };
        return [...prevItems, newItem];
      }
    });
  };

  // --- DISMINUIR CANTIDAD ---
  const decreaseQuantity = (uniqueId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.uniqueId === uniqueId);
      if (!existingItem) return prevItems;

      if (existingItem.quantity > 1) {
        // Restamos 1 y recalculamos precio
        return prevItems.map((item) =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.variant.price }
            : item
        );
      } else {
        // Si llega a 0, lo borramos
        return prevItems.filter((item) => item.uniqueId !== uniqueId);
      }
    });
  };

  // --- ELIMINAR COMPLETAMENTE UN ITEM ---
  const removeFromCart = (uniqueId: string) => {
    setCartItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  // --- LIMPIAR TODO ---
  const clearCart = () => setCartItems([]);

  // --- OBTENER CANTIDAD ---
  const getItemQuantity = (productId: number, variantId?: number) => {
    if (variantId) {
        // Cantidad exacta de esa variante
        const item = cartItems.find(i => i.uniqueId === `${productId}-${variantId}`);
        return item ? item.quantity : 0;
    }
    // Cantidad total del producto (todas sus variantes sumadas)
    return cartItems
      .filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // --- TOTALES ---
  // Calculamos dinámicamente cada vez que cambia el carrito
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        getItemQuantity,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};