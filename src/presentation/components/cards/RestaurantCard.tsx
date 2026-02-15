import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  id: number;
  name: string;
  categoria: string;
  urlImagen?: string;
  isSelected: boolean;
  onSelect: () => void;
  colors: typeof Colors.light; // Pasamos los colores para mantener consistencia
}

export const RestaurantCard: React.FC<Props> = ({
  name,
  categoria,
  urlImagen,
  isSelected,
  onSelect,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface || "#fff" }, // Fallback si no hay color definido
        isSelected && { backgroundColor: colors.tabIconSelected }, // Tu color de selección
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {urlImagen ? (
        <Image source={{ uri: urlImagen }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="restaurant" size={30} color="#fff" />
        </View>
      )}

      <Text
        style={[
          styles.name,
          { color: colors.text },
          isSelected && { fontWeight: "700", color: colors.textInverse },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text>{categoria}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginRight: 15,
    padding: 8,
    borderRadius: 16,
    width: 90,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginBottom: 5,
    backgroundColor: "#eee",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    width: "100%",
  },
});
