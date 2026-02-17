import { MappedPalette } from "@/src/domain/types/MappedPalette";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const GENERIC_PRODUCT_ID = 6;
const GENERIC_VARIANT_ID = 12;

interface Props {
  visible: boolean;
  onClose: () => void;
  serviceType: string;
  colors: MappedPalette;
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

  const mutation = useCreateOrder();
  const { user } = useAuth();
  
  // Optimizamos los estilos para que sean dinámicos y premium
  const styles = useMemo(() => createStyles(colors), [colors]);

  const SERVICE_FEE = 10.00;

  // Lógica de envío (Sin modificaciones de datos)
  const handleSendOrder = async () => {
    if (!user) {
      Alert.alert(
        "Inicio de sesión requerido",
        "Para realizar pedidos personalizados, necesitas una cuenta.",
        [
          { text: "Más tarde", style: "cancel" },
          { text: "Iniciar Sesión", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Falta información", text2: "Describe tu pedido" });
      return;
    }

    setIsLocating(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos tu ubicación para el envío.");
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const cleanDescription = description.replace(/\n/g, " ").trim();
      const cleanRef = addressReference.replace(/\n/g, " ").trim();
      const finalNote = `[${serviceType}] ${cleanDescription} | Ref: ${cleanRef || 'Sin referencia'}`;

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

      mutation.mutate(
        { payload },
        {
          onSuccess: (response) => {
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
            let message = mappingError(error);
            Alert.alert("Error", "Hubo un problema al enviar el pedido especial.");
          },
          onSettled: () => setIsLocating(false)
        }
      );

    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el pedido.");
      setIsLocating(false);
    }
  };

  const isLoading = mutation.isPending || isLocating;

  // Definimos un color de acento basado en el tipo de servicio
  const serviceColor = useMemo(() => {
    if (serviceType.toLowerCase().includes('botica')) return '#EF4444';
    if (serviceType.toLowerCase().includes('licor')) return '#8B5CF6';
    if (serviceType.toLowerCase().includes('bodega')) return '#F59E0B';
    return colors.primary;
  }, [serviceType, colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.container, { backgroundColor: colors.card }]}
        >
          {/* A. INDICADOR DE CIERRE */}
          <View style={[styles.dragHandle, { backgroundColor: colors.surfaceVariant }]} />

          {/* B. CABECERA CON ESTILO */}
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: `${serviceColor}15` }]}>
              <Ionicons 
                name={serviceType.toLowerCase().includes('botica') ? "medkit" : "bicycle"} 
                size={24} 
                color={serviceColor} 
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>Pedir {serviceType}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Lo que necesites, hasta tu puerta</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="close" size={20} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* C. INPUT DE DESCRIPCIÓN */}
            <Text style={[styles.label, { color: colors.text }]}>¿Qué debemos comprar por ti?</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej: 2 Panadol de 500mg, 1L de leche..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            {/* D. INPUT DE REFERENCIA */}
            <Text style={[styles.label, { color: colors.text }]}>¿Dónde lo compramos? (Opcional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={18} color="#475569"style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: En la tienda frente al parque..."
                placeholderTextColor="#475569"
                value={addressReference}
                onChangeText={setAddressReference}
                editable={!isLoading}
              />
            </View>

            {/* E. RESUMEN DE COSTO TIPO CARD */}
            <View style={styles.costCard}>
              <View style={styles.costInfo}>
                <Ionicons name="information-circle-outline" size={18} color={colors.info} />
                <Text style={styles.costLabel}>Tarifa por el servicio</Text>
              </View>
              <Text style={styles.costValue}>S/ {SERVICE_FEE.toFixed(2)}</Text>
            </View>
          </View>

          {/* F. BOTÓN DE ACCIÓN TIPO "10/10" */}
          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: serviceColor },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleSendOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.actionButtonText}>Confirmar pedido</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: MappedPalette) => StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "flex-end" 
  },
  dismissArea: { flex: 1 },
  container: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20 
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: 24 
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerText: { flex: 1 },
  title: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: '#1A1A1A', 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#8E8E93', 
    marginTop: 2,
    fontWeight: '500'
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 12
  },
  form: { marginBottom: 30 },
  label: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: '#1A1A1A', 
    marginBottom: 10, 
    marginTop: 16 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    paddingHorizontal: 16
  },
  textAreaWrapper: { alignItems: 'flex-start', paddingTop: 12 },
  inputIcon: { marginRight: 10 },
  input: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 15, 
    color: '#1A1A1A',
    fontWeight: '500'
  },
  textArea: { height: 100 },
  costCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 20, 
    padding: 16, 
    backgroundColor: '#F2F2F7',
    borderRadius: 16
  },
  costInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  costLabel: { 
    fontSize: 14, 
    color: '#3A3A3C', 
    fontWeight: '600' 
  },
  costValue: { 
    fontSize: 18, 
    color: '#1A1A1A', 
    fontWeight: '900' 
  },
  actionButton: { 
    height: 58,
    borderRadius: 18, 
    flexDirection: 'row',
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    elevation: 4 
  },
  actionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 17, 
    fontWeight: "800" 
  },
});