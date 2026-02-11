import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
interface Props {
  order: OrderEntity;
}

export const VerificationQrSection: React.FC<Props> = ({ order }) => {

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <View style={[styles.qrContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.qrTitle, { color: colors.text }]}>Código de verificación</Text>
      <Text style={[styles.qrTitle, { color: colors.success }]}>{order.pin}</Text>

      <View style={styles.qrWrapper}>
        <QRCode
          value={JSON.stringify({
            "id": order.id,
            "qrToken": order.qrToken,
            "timestamp": new Date(order.createdAt).getTime(),
            "type": "ORDER_VERIFICATION",
            "v": 1
          })}
          size={160}
          color="black"
          backgroundColor="white"
        />
      </View>

      <Text style={[styles.qrSubText, { color: colors.textSecondary }]}>
        Muestra este código al repartidor para confirmar la entrega.
      </Text>

      {/*<View style={styles.securityNote}>
         <Text style={styles.securityText}>Token seguro generado localmente (v1)</Text>
      </View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  qrWrapper: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 15,
  },
  qrSubText: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "80%",
  },
  securityNote: {
    marginTop: 15,
    backgroundColor: '#f0f9ff', // Un azul muy clarito para denotar "info/seguridad"
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  securityText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: "600"
  }
});