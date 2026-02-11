import { Colors } from "@/constants/Colors";
import { useUserList } from "@/src/presentation/hooks/useUserList";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDealer: (dealerId: number) => void;
  colors: typeof Colors.light;
}

export const DealerSelectorModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectDealer,
  colors,
}) => {
  const [searchText, setSearchText] = useState("");

  // 1. OBTENER USUARIOS
  const { data: response, isLoading } = useUserList({
    size: 100,
    fields: ["id", "name", "lastName", "roles", "enabled"],
  });

  const allUsers = response?.data?.content || [];

  // 2. FILTRO SEGURO DE REPARTIDORES (El mismo que validamos)
  const isRepartidor = (user: any) => {
    const r = user.roles;
    if (!r) return false;
    
    // Validamos todos los formatos posibles que pueda enviar tu backend
    if (r.role === "REPARTIDOR") return true;
    if (Array.isArray(r) && r.some((item: any) => item.role === "REPARTIDOR")) return true;
    if (Array.isArray(r) && r.includes("REPARTIDOR")) return true;
    
    return false;
  };

  // Filtramos repartidores que además estén ACTIVOS (enabled: true)
  const dealers = allUsers
    .filter(isRepartidor)
    .filter((u) => u.enabled); 

  const filteredDealers = dealers.filter((d) =>
    `${d.name} ${d.lastName}`.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Asignar Repartidor
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Buscador */}
          <View style={[styles.searchContainer, { borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Buscar repartidor disponible..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>

          {/* Lista */}
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
          ) : (
            <FlatList
              data={filteredDealers}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dealerItem, { borderBottomColor: colors.border }]}
                  onPress={() => onSelectDealer(item.id!)}
                >
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      {item.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.dealerName, { color: colors.text }]}>
                      {item.name} {item.lastName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="ellipse" size={8} color="green" style={{marginRight: 4}} />
                        <Text style={{ fontSize: 12, color: "green" }}>Disponible</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text } style={{marginLeft: 'auto'}}/>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 20}}>
                    <Text style={{color: "#999"}}>No hay repartidores activos.</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { height: "70%", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 18, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10 },
  dealerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  dealerName: { fontWeight: "bold", fontSize: 14 },
});