import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import { EPaymentMethod } from "@/src/domain/entities/SaleEntity";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useCreateOrder } from "@/src/presentation/hooks/useOrderMutation";

// IDs REALES DE TU BBDD (Confirmados)
const GENERIC_PRODUCT_ID = 6;  
const GENERIC_VARIANT_ID = 12; 

interface Props {
  visible: boolean;
  onClose: () => void;
  serviceType: string; 
  colors: typeof Colors.light;
}

export const CustomOrderModal: React.FC<Props> = ({
  visible,
  onClose,
  serviceType,
  colors,
}) => {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [addressReference, setAddressReference] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Usamos el hook igual que en CartClient
  const mutation = useCreateOrder();
  const { user } = useAuth();
  
  const SERVICE_FEE = 10.00; 

  const handleSendOrder = async () => {
    if (!user?.id) {
        Alert.alert("Error", "No se ha identificado al usuario.");
        return;
    }
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Falta información", text2: "Describe tu pedido" });
      return;
    }

    setIsLocating(true);

    try {
      // 1. Obtener Ubicación (Lógica idéntica a CartClient)
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos tu ubicación para el envío.");
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 2. Nota: Vamos a enviarla limpia y sin caracteres especiales 
      // para asegurar que el backend no la rechace.
      const cleanDescription = description.replace(/\n/g, " ").trim();
      const cleanRef = addressReference.replace(/\n/g, " ").trim();
      const finalNote = `[${serviceType}] ${cleanDescription} | Ref: ${cleanRef || 'Sin referencia'}`;

      // 3. CONSTRUCCIÓN DEL PAYLOAD (Copia exacta de CartClient)
      // No añadimos 'total', 'address' ni nada que no esté en CartClient
      const payload = {
        paymentMethod: EPaymentMethod.EFECTIVO,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        customerId: user.id,
        orderDetails: [
          {
            productId: GENERIC_PRODUCT_ID,
            variantId: GENERIC_VARIANT_ID, 
            amount: 1,
            unitPrice: SERVICE_FEE,
            note: finalNote,
          },
        ],
      };

      console.log("Payload Estilo CartClient:", JSON.stringify(payload));

      // 4. Enviar usando el mismo patrón que CartClient (.mutate)
      mutation.mutate(
        { payload },
        {
          onSuccess: (response) => {
            // Validamos con isSuccess según tu ResponseStatusDTO
            if (response.isSuccess) {
                Toast.show({ 
                    type: "success", 
                    text1: "¡Pedido Exitoso!", 
                    text2: "Tu mandadito ha sido registrado." 
                });
                onClose();
                setDescription("");
                setAddressReference("");
                router.push("/OrderHistoryClient");
            } else {
                Alert.alert("Error", response.message || "No se pudo registrar el pedido.");
            }
          },
          onError: (error: any) => {
            // Usamos tu función mappingError igual que en el carrito
            let message = mappingError(error);
            console.error("Error API:", message);
            Alert.alert("Error", "Hubo un problema al enviar el pedido especial.");
          },
          onSettled: () => {
            setIsLocating(false);
          }
        }
      );

    } catch (error) {
      console.error("Catch Error:", error);
      Alert.alert("Error", "No se pudo procesar el pedido.");
      setIsLocating(false);
    }
  };

  const isLoading = mutation.isPending || isLocating;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
                <Text style={styles.title}>Pedir {serviceType}</Text>
                <Text style={styles.subtitle}>Lo que necesites hasta tu puerta</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>¿Qué debemos comprar?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Medicinas, víveres, herramientas..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
              editable={!isLoading}
            />

            <Text style={styles.label}>¿Donde lo compramos? (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: En la botica de la esquina..."
              value={addressReference}
              onChangeText={setAddressReference}
              editable={!isLoading}
            />

            <View style={styles.costRow}>
                <Text style={styles.costLabel}>Tarifa de servicio:</Text>
                <Text style={styles.costValue}>S/. {SERVICE_FEE.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, isLoading && { opacity: 0.7 }]}
            onPress={handleSendOrder}
            disabled={isLoading}
          >
            {isLoading ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <Text style={styles.actionButtonText}>Confirmar Mandadito</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  dismissArea: { flex: 1 },
  container: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, elevation: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  closeButton: { padding: 8, backgroundColor: "#F3F4F6", borderRadius: 20 },
  form: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, fontSize: 14, color: "#1F2937" },
  textArea: { height: 80 },
  actionButton: { backgroundColor: "#E63946", borderRadius: 16, paddingVertical: 16, alignItems: "center", shadowColor: "#E63946", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 4 },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  costLabel: { fontSize: 14, color: '#374151', fontWeight: '600' },
  costValue: { fontSize: 16, color: '#111827', fontWeight: '800' },
});