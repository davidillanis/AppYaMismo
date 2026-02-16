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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={[
        styles.ring, 
        { borderColor: isSelected ? colors.primary : 'transparent' }
      ]}>
        {urlImagen ? (
          <Image source={{ uri: urlImagen }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="restaurant-outline" size={24} color={colors.textTertiary} />
          </View>
        )}
        
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>

      <Text
        style={[
          styles.name,
          { color: isSelected ? colors.text : colors.textSecondary },
          isSelected && { fontWeight: "800" },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
      
      <Text style={[styles.category, { color: colors.textTertiary }]} numberOfLines={1}>
        {categoria}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 18,
    width: 80, // Un poco más ancho para legibilidad
  },
  ring: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2.5,
    padding: 3, // Espacio entre el anillo y la imagen
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30, // Imagen casi circular
    backgroundColor: "#F3F4F6",
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  name: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
    width: "100%",
    marginBottom: 2,
    color: '#1A1A1A', // Aseguramos un negro nítido
  },
  category: {
    fontSize: 11, // Un pelín más grande para legibilidad
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
    color: '#8E8E93', // Gris elegante
  }
  
});