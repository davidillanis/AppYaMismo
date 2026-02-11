import { Colors } from "@/constants/Colors";
import { OperatorEntity } from "@/src/domain/entities/UserEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Switch, Text, View } from "react-native";

interface Props {
  operator: OperatorEntity;
  colors: typeof Colors.light;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
}

export const DealerCardAdmin: React.FC<Props> = ({
  operator,
  colors,
  onToggleStatus,
}) => {
  const user = operator.userEntity;
  // Buscamos si tiene un vehículo activo asignado
  const activeAssignment = operator.assignmentSet?.find(a => a.active);
  const vehicle = activeAssignment?.vehicle;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      
      {/* 1. Encabezado: Foto y Datos Personales */}
      <View style={styles.header}>
        <Image
          source={{ uri: user.imageUrl || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user.name} {user.lastName}
          </Text>
          <Text style={[styles.license, { color: colors.textSecondary }]}>
            Licencia: {operator.license}
          </Text>
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
            <Ionicons name="call-outline" size={12} /> {user.phone || "Sin teléfono"}
          </Text>
        </View>
        
        {/* Switch de Estado */}
        <View style={styles.statusContainer}>
             <Switch
                value={user.enabled ?? true}
                onValueChange={() => onToggleStatus(user.id!, user.enabled ?? true)}
                trackColor={{ false: "#ccc", true: colors.primary + "80" }}
                thumbColor={user.enabled ? colors.primary : "#f4f3f4"}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
            />
            <Text style={{ fontSize: 10, color: user.enabled ? colors.success : colors.error }}>
                {user.enabled ? 'ACTIVO' : 'INACTIVO'}
            </Text>
        </View>
      </View>

      {/* 2. Información Operativa (Vehículo) */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.vehicleInfo}>
            <Ionicons 
                name={vehicle ? "car-sport-outline" : "walk-outline"} 
                size={18} 
                color={vehicle ? colors.success : colors.primary} 
            />
            <Text style={[styles.vehicleText, { color: colors.primary }]}>
                {vehicle 
                    ? `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}` 
                    : "Sin vehículo asignado"}
            </Text>
        </View>
        
        {/* Badge de Salario (Opcional) */}
        <View style={[styles.salaryBadge, { backgroundColor: "#E0F7FA" }]}>
            <Text style={{ fontSize: 10, color: "#006064", fontWeight: "bold" }}>
                S/. {operator.salary}
            </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontWeight: 'bold', fontSize: 15 },
  license: { fontSize: 12, marginTop: 2 },
  phone: { fontSize: 12, marginTop: 2 },
  statusContainer: { alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1 },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleText: { fontSize: 12, fontWeight: '500' },
  salaryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }
});