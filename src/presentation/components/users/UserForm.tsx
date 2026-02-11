import { Colors } from "@/constants/Colors";
import { ERole } from "@/src/domain/entities/UserEntity";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UserFormProps {
  initialValues?: any; // Si existe, estamos en modo EDICIÓN
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
  colors: typeof Colors.light;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  colors,
}) => {
  // Estado del Formulario
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    dni: "",
    phone: "",
    email: "",
    password: "", // Solo para crear
    role: ERole.CLIENTE,
    license: "",
    salary: "",
  });

  const isEditing = !!initialValues;

  // Cargar datos al iniciar si es edición
  useEffect(() => {
    if (initialValues) {
        setForm(prev => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) return alert("Nombre y Email son obligatorios");
    if (!isEditing && !form.password) return alert("La contraseña es obligatoria");
    
    // Validación de Repartidor solo al crear (al editar, license/salary podrían no venir en el objeto simple de usuario)
    if (!isEditing && form.role === ERole.REPARTIDOR && (!form.license || !form.salary)) {
        return alert("Licencia y Salario son obligatorios para nuevos Repartidores");
    }
    
    onSubmit(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos Personales</Text>
      
      {/* NOMBRE Y APELLIDO (Editables) */}
      <View style={styles.row}>
        <View style={styles.halfInput}>
            <Text style={[styles.label, {color: colors.text}]}>Nombre</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.textSecondary }]}
                value={form.name}
                onChangeText={(t) => handleChange("name", t)}
                placeholder="Ej: Juan"
                placeholderTextColor={colors.textSecondary}
            />
        </View>
        <View style={styles.halfInput}>
            <Text style={[styles.label, {color: colors.text}]}>Apellidos</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={form.lastName}
                onChangeText={(t) => handleChange("lastName", t)}
                placeholder="Ej: Pérez"
                placeholderTextColor={colors.textSecondary}
            />
        </View>
      </View>

      {/* EMAIL (Bloqueado en Edición) */}
      <View>
          <Text style={[styles.label, {color: colors.text}]}>Correo Electrónico</Text>
          <TextInput
            style={[
                styles.input, 
                { borderColor: colors.border, color: colors.text },
                isEditing && styles.disabledInput // Estilo visual de bloqueo
            ]}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isEditing} // Bloqueo lógico
            placeholder="Ej: jose@gmail.com"
            placeholderTextColor={colors.textSecondary}
          />
          {isEditing && (
             <Text style={styles.helperText}>El correo no se puede editar por seguridad.</Text>
          )}
      </View>

      {/* CONTRASEÑA (Solo visible al Crear) */}
      {!isEditing && (
        <>
            <Text style={[styles.label, {color: colors.text}]}>Contraseña</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={form.password}
                onChangeText={(t) => handleChange("password", t)}
                secureTextEntry
                placeholder="••••••"
                placeholderTextColor={colors.textSecondary}
            />
        </>
      )}

      {/* DNI Y TELÉFONO (Editables) */}
      <View style={styles.row}>
        <View style={styles.halfInput}>
            <Text style={[styles.label, {color: colors.text}]}>DNI</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={form.dni}
                onChangeText={(t) => handleChange("dni", t)}
                keyboardType="numeric"
                placeholder="Ej: 72564443"
                placeholderTextColor={colors.textSecondary}
            />
        </View>
        <View style={styles.halfInput}>
            <Text style={[styles.label, {color: colors.text}]}>Teléfono</Text>
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                value={form.phone}
                onChangeText={(t) => handleChange("phone", t)}
                keyboardType="phone-pad"
                placeholder="Ej: 984 863 436"
                placeholderTextColor={colors.textSecondary}
            />
        </View>
      </View>

      {/* SELECTOR DE ROL (Bloqueado en Edición) */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Rol del Usuario {isEditing && <Text style={{fontSize: 12, fontWeight: 'normal'}}>(No editable)</Text>}
      </Text>
      
      <View style={styles.roleContainer}>
        {[ERole.CLIENTE, ERole.ADMINISTRADOR, ERole.REPARTIDOR, ERole.RESTAURANTE].map((r) => {
            const isSelected = form.role === r;
            return (
                <TouchableOpacity
                    key={r}
                    style={[
                        styles.roleChip,
                        isSelected ? { backgroundColor: colors.primary } : { backgroundColor: "#e0e0e0" },
                        // Si estamos editando y NO es el seleccionado, lo hacemos transparente
                        isEditing && !isSelected && { opacity: 0.3 } 
                    ]}
                    onPress={() => handleChange("role", r)}
                    disabled={isEditing} // Bloqueo lógico
                >
                    <Text style={{ 
                        color: isSelected ? "#fff" : "#333", 
                        fontWeight: "600", 
                        fontSize: 12 
                    }}>
                        {r}
                    </Text>
                </TouchableOpacity>
            );
        })}
      </View>

      {/* CAMPOS REPARTIDOR (Solo visibles al Crear un Repartidor) */}
      {/* En edición, el backend no retorna salary/license en el UserEntity simple, así que los ocultamos para no mostrar vacíos */}
      {!isEditing && form.role === ERole.REPARTIDOR && (
        <View style={[styles.extraSection, { backgroundColor: colors.surface, borderColor: colors.text }]}>
            <Text style={[styles.label, {color: colors.info, marginBottom: 10}]}>
                <Ionicons name="bicycle" /> Datos de Operador (Requerido)
            </Text>
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={[styles.label, {color: colors.text}]}>Licencia</Text>
                    <TextInput
                        style={[styles.input, { borderColor: colors.info, color: colors.text }]}
                        value={form.license}
                        onChangeText={(t) => handleChange("license", t)}
                        placeholder="Ej: A-123456"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={[styles.label, {color: colors.text}]}>Salario (S/.)</Text>
                    <TextInput
                        style={[styles.input, { borderColor: colors.info, color: colors.text }]}
                        value={form.salary}
                        onChangeText={(t) => handleChange("salary", t)}
                        keyboardType="numeric"
                        placeholder="Ej: 1200"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>
        </View>
      )}

      {/* BOTÓN DE ACCIÓN */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Usuario"}
        </Text>
      </TouchableOpacity>

      {/* Botón secundario para cancelar/volver solo si es edición (Opcional, mejora UX) */}
      {isEditing && (
          <View style={{height: 50}} /> // Espacio extra al final
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 14 },
  disabledInput: { backgroundColor: "#f0f0f0", color: "#999", borderColor: "#ddd" }, // Estilo gris
  helperText: { fontSize: 11, color: "#999", marginTop: -10, marginBottom: 15, fontStyle: 'italic' },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  halfInput: { flex: 1 },
  roleContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 15 },
  roleChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  extraSection: { padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: "#eee" },
  submitButton: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});