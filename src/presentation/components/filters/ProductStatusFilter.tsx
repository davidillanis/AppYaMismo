import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Opciones específicas para productos
const FILTER_OPTIONS = [
  { id: "ALL", label: "Todos" },
  { id: "ACTIVE", label: "Activos" },   // enabled: true
  { id: "INACTIVE", label: "Inactivos" } // enabled: false
];

interface Props {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  colors: any;
  backgroundColor?: string;
}

export const ProductStatusFilter: React.FC<Props> = ({
  selectedStatus,
  onSelectStatus,
  colors,
  backgroundColor,
}) => {
  return (
    <View style={[styles.filterContainer, backgroundColor && { backgroundColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {FILTER_OPTIONS.map((item) => {
          const isSelected = selectedStatus === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectStatus(item.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.primary : "#C4A676",
                  borderColor: isSelected ? colors.primary : "#C4A676",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? "#fff" : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    // Eliminamos borde inferior para que se integre mejor con los chips de categoría
  },
  filterScrollContent: {
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
});