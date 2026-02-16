import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  id: number;
  name: string;
  categoria: string;
  urlImagen?: string;
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
}

export const RestaurantCard: React.FC<Props> = ({
  name,
  categoria,
  urlImagen,
  isSelected,
  onSelect,
  colors,
}) => {
  const styles = useMemo(
    () => createStyles(colors, isSelected),
    [colors, isSelected],
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <View style={styles.ring}>
        <View style={styles.imageWrapper}>
          {urlImagen ? (
            <Image source={{ uri: urlImagen }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              {/* Icono para "Todos" o sin imagen */}
              <Ionicons
                name={name === "Todos" ? "restaurant" : "restaurant-outline"}
                size={24}
                color={isSelected ? colors.primary : colors.textTertiary}
              />
            </View>
          )}
        </View>

        {isSelected && (
          <View
            style={[styles.checkBadge, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>

      <Text
        style={[
          styles.name,
          isSelected && { color: colors.primary, fontWeight: "900" },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text style={styles.category} numberOfLines={1}>
        {categoria}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isSelected: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginRight: 12, // Reducimos margen derecho para compensar el ancho mayor
      width: 95, // 🟢 Aumentamos de 82 a 95 para dar espacio lateral
      paddingVertical: 5, // 🟢 Espacio para que la sombra no se corte arriba/abajo
      zIndex: isSelected ? 10 : 1, // 🟢 El seleccionado se encima a los demás
    },
    ring: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: isSelected ? 3 : 1.5,
      borderColor: isSelected ? colors.primary : "#E5E5EA",
      padding: 3,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "#FFF", // 🟢 Fondo blanco para que el ring destaque
      // 🟢 Manejo de Escala
      transform: [{ scale: isSelected ? 1.12 : 1 }],
      // 🟢 Sombra / Glow optimizado
      shadowColor: isSelected ? colors.primary : "#000",
      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
      shadowOpacity: isSelected ? 0.4 : 0.05,
      shadowRadius: isSelected ? 8 : 4,
      elevation: isSelected ? 8 : 2,
    },
    imageWrapper: {
      width: "100%",
      height: "100%",
      borderRadius: 30,
      overflow: "hidden",
      backgroundColor: "#F2F2F7",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    placeholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    checkBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#FFFFFF",
      elevation: 4,
      transform: [{ scale: isSelected ? 0.9 : 1 }], // Evitamos que el badge crezca de más
    },
    name: {
      fontSize: 12,
      textAlign: "center",
      fontWeight: "600",
      color: "#FFFFFF",
      width: "100%",
      marginTop: 4,
    },
    category: {
      fontSize: 10,
      fontWeight: "600",
      textAlign: "center",
      color: "#8E8E93",
      width: "100%",
    },
  });
