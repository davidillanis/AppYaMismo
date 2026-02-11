import { Colors } from "@/constants/Colors";
import { ERole, UserEntity } from "@/src/domain/entities/UserEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Switch, Text, View } from "react-native";

interface Props {
  user: UserEntity;
  colors: typeof Colors.light;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

// Configuración visual por Rol
const ROLE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  [ERole.ADMINISTRADOR]: { color: "#D32F2F", label: "ADMIN", icon: "shield-checkmark" }, // Rojo
  [ERole.CLIENTE]: { color: "#388E3C", label: "CLIENTE", icon: "person" }, // Verde
  [ERole.REPARTIDOR]: { color: "#F57C00", label: "RIDER", icon: "bicycle" }, // Naranja
  [ERole.RESTAURANTE]: { color: "#1976D2", label: "GERENTE", icon: "business" }, // Azul (Aclaración: Gerente del restaurante)
  [ERole.DEVELOPMENT]: { color: "#616161", label: "DEV", icon: "code-slash" }, // Gris
};

export const UserCard: React.FC<Props> = ({ user, colors, onToggleStatus }) => {
  
  // 🛡️ Lógica Segura para Extraer el Nombre del Rol
  // Maneja los 3 casos posibles: String, Objeto {role:...} o Array
  const getRoleName = (r: any): string => {
    if (!r) return "SIN ROL";
    
    // Caso 1: String directo "RESTAURANTE"
    if (typeof r === 'string') return r;
    
    // Caso 2: Objeto { id: 1, role: "RESTAURANTE" }
    if (r.role) return r.role;
    
    // Caso 3: Array ["RESTAURANTE"] o [{role: "..."}]
    if (Array.isArray(r) && r.length > 0) {
        const first = r[0];
        return typeof first === 'string' ? first : (first.role || "DESCONOCIDO");
    }
    
    return "DESCONOCIDO";
  };

  const rawRole = getRoleName(user.roles);
  const config = ROLE_CONFIG[rawRole] || ROLE_CONFIG[ERole.CLIENTE];

  const fullName = user.name ? `${user.name} ${user.lastName || ''}` : "Usuario Sin Nombre";
  const avatarUrl = user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        {/* Avatar */}
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />

        {/* Info Principal */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
              <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
              
              {/* Badge de Rol */}
              <View style={[styles.roleBadge, { backgroundColor: config.color + "20" }]}>
                <Ionicons name={config.icon as any} size={10} color={config.color} style={{ marginRight: 4 }} />
                <Text style={[styles.roleText, { color: config.color }]}>{config.label}</Text>
              </View>
          </View>
          
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email || "Sin correo"}</Text>
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
             <Ionicons name="call-outline" size={12} /> {user.phone || "--"}
          </Text>
        </View>

        {/* Switch de Estado */}
        <View style={styles.actionContainer}>
           <Switch
              value={user.enabled ?? true}
              onValueChange={() => onToggleStatus(user.id!, user.enabled ?? true)}
              trackColor={{ false: "#ccc", true: colors.primary + "80" }}
              thumbColor={user.enabled ? colors.primary : "#f4f3f4"}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
           />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginBottom: 10, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: {width:0, height:2} },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#eee" },
  infoContainer: { flex: 1, marginLeft: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontWeight: "bold", fontSize: 14, flex: 1, marginRight: 5 },
  email: { fontSize: 12, marginBottom: 2 },
  phone: { fontSize: 12 },
  roleBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 9, fontWeight: "bold" },
  actionContainer: { paddingLeft: 5 },
});