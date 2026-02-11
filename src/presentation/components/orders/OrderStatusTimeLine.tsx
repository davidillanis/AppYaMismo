import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EOrderStatus } from "@/src/domain/entities/OrderEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  currentStatus: EOrderStatus;
  date: Date | string; // Fecha de creación para el primer paso
}

// Definimos los pasos lógicos del pedido
const STEPS = [
  { key: EOrderStatus.PENDIENTE, label: "Pedido Recibido", icon: "receipt" },
  { key: EOrderStatus.EN_CAMINO, label: "En Camino", icon: "bicycle" },
  { key: EOrderStatus.ENTREGADO, label: "Entregado", icon: "checkmark-circle" },
];

export const OrderStatusTimeline: React.FC<Props> = ({ currentStatus, date }) => {
  // 1. Manejo especial para estados negativos
  if (currentStatus === EOrderStatus.CANCELADO || currentStatus === EOrderStatus.RECHAZADO) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={24} color="#FF3B30" />
        <Text style={styles.errorText}>
          El pedido fue {currentStatus === EOrderStatus.CANCELADO ? "cancelado" : "rechazado"}.
        </Text>
      </View>
    );
  }

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // 2. Determinar índice actual para saber qué pasos pintar
  const getCurrentStepIndex = () => {
    return STEPS.findIndex((s) => s.key === currentStatus);
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {STEPS.map((step, index) => {
        // Lógica de estado visual
        // Si el índice del paso es menor o igual al estado actual del pedido, está "completado/activo"
        // Nota: Si el estado es "ENTREGADO" (idx 2), "PENDIENTE" (idx 0) también debe verse activo.
        
        // HACK: Como EN_CAMINO no es estrictamente mayor que PENDIENTE en string, 
        // usamos el índice del array STEPS.
        
        const isCompleted = index <= activeIndex;
        const isLast = index === STEPS.length - 1;

        // Color
        const color = isCompleted ? Colors.light.primary : "#ccc"; // Ajusta a tu color primario
        const iconName = isCompleted ? step.icon : "ellipse-outline";

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Columna Izquierda: Línea e Icono */}
            <View style={styles.timelineLeft}>
              <View style={[styles.iconContainer, { borderColor: color }]}>
                <Ionicons name={iconName as any} size={14} color={color} />
              </View>
              {/* Línea conectora (no se muestra en el último paso) */}
              {!isLast && (
                <View style={[styles.line, { backgroundColor: index < activeIndex ? Colors.light.primary : "#e0e0e0" }]} />
              )}
            </View>

            {/* Columna Derecha: Textos */}
            <View style={styles.timelineRight}>
              <Text style={[styles.stepLabel, { color: isCompleted ? colors.text : colors.text, fontWeight: isCompleted ? "700" : "400" }]}>
                {step.label}
              </Text>
              {/* Solo mostramos fecha en el primer paso porque es el único dato real que tenemos (createdAt) */}
              {index === 0 && (
                <Text style={[styles.stepDate, { color: colors.text }]}>
                  {new Date(date).toLocaleDateString()} - {new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              )}
               {/* Mensaje dinámico para el paso activo */}
               {index === activeIndex && index !== 0 && (
                <Text style={[styles.activeStatusText, { color: colors.textSecondary }]}>Estado Actual</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    fontWeight: '600'
  },
  stepRow: {
    flexDirection: "row",
    height: 50, // Altura fija para mantener consistencia
  },
  timelineLeft: {
    alignItems: "center",
    width: 30,
    marginRight: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1, // Para que esté sobre la línea
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -2, // Pequeño ajuste para conectar bien
    zIndex: 0,
  },
  timelineRight: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 2 // Alinear visualmente con el icono
  },
  stepLabel: {
    fontSize: 14,
  },
  stepDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  activeStatusText: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: "bold",
    marginTop: 2
  }
});