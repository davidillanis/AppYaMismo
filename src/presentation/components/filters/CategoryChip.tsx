import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const CategoryChip: React.FC<Props> = ({
  name,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={[
        styles.container,
        isSelected ? styles.activeContainer : styles.inactiveContainer
      ]}
    >
      <Text style={[
        styles.text, 
        isSelected ? styles.activeText : styles.inactiveText
      ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    // Alineación
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estado Inactivo (Clean)
  inactiveContainer: {
    backgroundColor: "#F3F4F6", // Gris muy suave
    borderColor: "#E5E7EB", // Borde sutil
  },
  // Estado Activo (Brand)
  activeContainer: {
    backgroundColor: "#E63946", // TU ROJO DE MARCA
    borderColor: "#E63946",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  text: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  inactiveText: {
    color: "#4B5563", // Gris oscuro legible
  },
  activeText: {
    color: "#FFFFFF", // Blanco puro
    fontWeight: "700",
  },
});