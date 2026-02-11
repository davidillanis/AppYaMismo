import { Colors } from "@/constants/Colors";
import { RestaurantEntity } from "@/src/domain/entities/RestaurantEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface Props {
  restaurant: RestaurantEntity;
  colors: typeof Colors.light;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

export const RestaurantCardAdmin: React.FC<Props> = ({
  restaurant,
  colors,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* 1. Imagen y Estado */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.urlImagen || "https://via.placeholder.com/100" }}
          style={styles.image}
        />
        <View style={[styles.badge, { backgroundColor: restaurant.enabled ? "#4CAF50" : "#F44336" }]}>
            <Text style={styles.badgeText}>{restaurant.enabled ? "ACTIVO" : "INACTIVO"}</Text>
        </View>
      </View>

      {/* 2. Información */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
          <Ionicons name="location-outline" size={12} /> {restaurant.address}
        </Text>
        
        {/* Tipos de comida (Chips pequeños) */}
        <View style={styles.typesContainer}>
            {restaurant.restaurantTypes?.slice(0, 2).map((type) => (
                <View key={type.id} style={[styles.typeChip, { backgroundColor: colors.background }]}>
                    <Text style={[styles.typeText, { color: colors.textSecondary }]}>{type.name}</Text>
                </View>
            ))}
        </View>
      </View>

      {/* 3. Acciones */}
      <View style={styles.actionsContainer}>
        <Switch
            value={restaurant.enabled}
            onValueChange={() => onToggleStatus(restaurant.id, restaurant.enabled)}
            trackColor={{ false: "#ccc", true: colors.primary + "80" }}
            thumbColor={restaurant.enabled ? colors.primary : "#f4f3f4"}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
        />
        
        <TouchableOpacity 
            onPress={() => onEdit(restaurant.id)} 
            style={[styles.actionButton, { backgroundColor: "#FFA000" }]}
        >
            <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => onDelete(restaurant.id)} 
            style={[styles.actionButton, { backgroundColor: "#D32F2F" }]}
        >
            <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center'
  },
  imageContainer: { position: 'relative' },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    left: 10,
    right: 10,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center'
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    marginBottom: 6,
  },
  typesContainer: { flexDirection: 'row', gap: 4 },
  typeChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#eee' },
  typeText: { fontSize: 10 },
  actionsContainer: {
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});