import { MappedPalette } from "@/src/domain/types/MappedPalette";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  colors: MappedPalette; // Añadimos los colores como prop
}

export const CategoryChip: React.FC<Props> = ({
  name,
  isSelected,
  onSelect,
  colors,
}) => {
  // Generamos los estilos dinámicos para soportar modo claro/oscuro
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      style={[
        styles.container,
        isSelected ? styles.activeContainer : styles.inactiveContainer,
      ]}
    >
      {/* TIP DE DISEÑO: Podrías añadir un pequeño punto indicador 
        solo cuando está seleccionado para extra feedback visual.
      */}
      {isSelected && (
        <View style={[styles.activeDot, { backgroundColor: "#FFF" }]} />
      )}

      <Text
        style={[
          styles.text,
          isSelected ? styles.activeText : styles.inactiveText,
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: MappedPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20, // Más aire lateral
      paddingVertical: 10,
      borderRadius: 16, // Curvatura consistente con las cards
      marginRight: 10,
      borderWidth: 1.5, // Borde un poco más grueso pero sutil
      justifyContent: "center",
    },
    // Estado Inactivo: Fondo casi transparente y borde suave
    inactiveContainer: {
      backgroundColor: "#FFFFFF",
      borderColor: "#F2F2F7",
      // Sombra muy sutil para que el chip "respire" sobre el fondo gris
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    // Estado Activo: Color de marca con brillo
    activeContainer: {
      backgroundColor: colors.primary, // Usamos tu rojo de YaMismo
      borderColor: colors.primary,
      // Sombra de color (Glow effect)
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 8,
    },
    text: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: -0.2, // Kerning moderno
    },
    inactiveText: {
      color: "#050505", // Gris iOS estándar
    },
    activeText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },
  });
