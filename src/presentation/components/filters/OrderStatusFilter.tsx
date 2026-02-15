import { EOrderStatus } from "@/src/domain/entities/OrderEntity";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Movemos la constante aquí porque pertenece a la UI del filtro
const FILTER_OPTIONS = [
  { id: "ALL", label: "Todos" },
  { id: EOrderStatus.PENDIENTE, label: "Pendientes" },
  { id: EOrderStatus.EN_CAMINO, label: "En Camino" },
  { id: EOrderStatus.ENTREGADO, label: "Entregados" },
  { id: EOrderStatus.CANCELADO, label: "Cancelados" },
  { id: EOrderStatus.RECHAZADO, label: "Rechazados" },
];

interface Props {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  colors: any; // O el tipo Colors de tu tema
  backgroundColor?: string;
}

export const OrderStatusFilter: React.FC<Props> = ({
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

export const getFilterLabel = (statusId: string) => {
    const option = FILTER_OPTIONS.find(o => o.id === statusId);
    return option ? option.label : "Desconocido";
}

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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