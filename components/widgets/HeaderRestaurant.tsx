import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  colors: any;
  loading?: boolean;
  normalize: (size: number) => number;
  onProfilePress?: () => void; // 🆕 NUEVA PROP
}

export const RestaurantHeader: React.FC<Props> = ({
  title,
  subtitle = "Gestión de Carta",
  colors,
  loading,
  normalize,
  onProfilePress, // 🆕 RECIBIMOS AQUÍ
}) => {
  const router = useRouter();

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress(); // usa la función personalizada
    } else {
      router.push("/(tabs)/ProfileRestaurant");
    }
  };

  return (
    <View style={styles.headerRow}>
      {/* 🔙 Botón volver */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* 🏠 Título */}
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.title, { color: colors.text, fontSize: normalize(20) }]}
          numberOfLines={1}
        >
          {loading ? "Cargando..." : title}
        </Text>
        <Text
          style={[styles.subtitle, { color: colors.textSecondary, fontSize: normalize(14) }]}
        >
          {subtitle}
        </Text>
      </View>

      {/* 👤 Imagen de perfil */}
      <TouchableOpacity
        onPress={handleProfilePress}
        activeOpacity={0.8}
        style={styles.profileContainer}
      >
        <Image
          source={require("@/assets/images/restaurant.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingBottom: 5,
  },
  backButton: { marginRight: 10, padding: 5 },
  title: { fontWeight: "bold" },
  subtitle: {},
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 20,
  },
});


