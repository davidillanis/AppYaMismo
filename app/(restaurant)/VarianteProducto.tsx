import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VariantRequestDTO } from "@/src/domain/entities/ProductEntity";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VariantesProducto = () => {
  const { variants } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const normalize = (size: number) => normalizeScreen(size, 390);

  const [lista, setLista] = useState<VariantRequestDTO[]>(
    variants ? JSON.parse(String(variants)) : []
  );

  const agregarVariante = () => {
    setLista([...lista, { name: "", price: 0, stock: 0 }]);
  };

  const actualizar = (
    index: number,
    field: keyof VariantRequestDTO,
    value: any
  ) => {
    const copia = [...lista];
    copia[index] = { ...copia[index], [field]: value };
    setLista(copia);
  };

  const guardar = () => {
    router.replace({
      pathname: "../AgregarProducto",
      params: {
        variants: JSON.stringify(lista),
      },
    });
  };

  const styles = createStyles(colors, normalize);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Variantes del Producto</Text>

        {lista.map((item, index) => (
          <View key={index} style={styles.card}>
            <TextInput
              placeholder="Tamaño / Nombre"
              style={styles.input}
              value={item.name}
              onChangeText={(v) => actualizar(index, "name", v)}
            />
            <TextInput
              placeholder="Precio"
              keyboardType="numeric"
              style={styles.input}
              value={item.price === 0 ? "" : String(item.price)}
              onChangeText={(v) =>
                actualizar(index, "price", v === "" ? 0 : Number(v))
              }
            />
            <TextInput
              placeholder="Stock"
              keyboardType="numeric"
              style={styles.input}
              value={item.stock === 0 ? "" : String(item.stock)}
              onChangeText={(v) =>
                actualizar(index, "stock", v === "" ? 0 : Number(v))
              }
            />
          </View>
        ))}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity style={styles.fab} onPress={agregarVariante}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={guardar}>
        <Text style={styles.saveText}>Guardar Variantes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, normalize: any) =>
  StyleSheet.create({
    container: { padding: 20, backgroundColor: colors.background },
    title: {
      fontSize: normalize(18),
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.text,
    },
    card: {
      backgroundColor: "#F8EBD3",
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    input: {
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    fab: {
      position: "absolute",
      bottom: 90,
      right: 20,
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 15,
      alignItems: "center",
      paddingBottom: 25, // 👈 evita que quede debajo de la barra del sistema
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });

export default VariantesProducto;
