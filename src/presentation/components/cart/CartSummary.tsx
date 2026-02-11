import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  colors: typeof Colors.light;
  onCheckout: () => void;
  total: number; // 👈 AGREGAMOS ESTA PROPIEDAD
}

export const CartSummary: React.FC<Props> = ({ colors, onCheckout, total }) => {
  // Ya no calculamos el total aquí adentro, usamos el que viene por props (del contexto)
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: '#eee' }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Subtotal</Text>
        <Text style={[styles.value, { color: colors.text }]}>S/. {total.toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Entrega</Text>
        <Text style={[styles.value, { color: colors.text }]}>S/. 0.00</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: '#eee' }]} />

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>S/. {total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
        onPress={onCheckout}
        activeOpacity={0.8}
      >
        <Text style={styles.checkoutText}>Confirmar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderTopWidth: 1,
    elevation: 20, // Sombra fuerte hacia arriba
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
});