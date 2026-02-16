import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableOptions: string[]; // Categorías que ya existen en tu BBDD
  colors: any;
  label: string;
}

export const CategorySelector: React.FC<Props> = ({
  selectedTags,
  onTagsChange,
  availableOptions,
  colors,
  label,
}) => {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtramos las opciones basadas en lo que el usuario escribe
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const matches = availableOptions.filter(
      (opt) => opt.toLowerCase().includes(normalizedQuery) && !selectedTags.includes(opt)
    );

    // Si lo que escribió no coincide exactamente con nada, permitimos "Crear"
    const exactMatch = availableOptions.some((opt) => opt.toLowerCase() === normalizedQuery);
    
    if (!exactMatch && normalizedQuery.length > 0) {
        return [...matches, `Añadir "${query.trim()}"` as string];
    }

    return matches;
  }, [query, availableOptions, selectedTags]);

  const addTag = (tag: string) => {
    // Si seleccionó la opción de "Añadir...", extraemos el texto limpio
    const finalTag = tag.startsWith('Añadir "') ? tag.slice(8, -1) : tag;
    
    if (!selectedTags.includes(finalTag)) {
      onTagsChange([...selectedTags, finalTag]);
    }
    setQuery("");
    setIsDropdownOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      
      {/* Contenedor de Etiquetas Seleccionadas */}
      <View style={styles.tagsContainer}>
        {selectedTags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Input de Búsqueda / Creación */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Escribe para buscar o crear categoría..."
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setIsDropdownOpen(text.length > 0);
          }}
          onFocus={() => query.length > 0 && setIsDropdownOpen(true)}
        />
        {query.length > 0 && (
            <TouchableOpacity onPress={() => {setQuery(""); setIsDropdownOpen(false)}}>
                <Ionicons name="close-outline" size={20} color="#999" />
            </TouchableOpacity>
        )}
      </View>

      {/* Dropdown de Sugerencias */}
      {isDropdownOpen && filteredOptions.length > 0 && (
        <View style={styles.dropdown}>
          {filteredOptions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.dropdownItem} 
              onPress={() => addTag(item)}
            >
              <Ionicons 
                name={item.startsWith("Añadir") ? "add-circle-outline" : "pricetag-outline"} 
                size={18} 
                color={item.startsWith("Añadir") ? colors.primary : "#666"} 
              />
              <Text style={[
                styles.dropdownText, 
                item.startsWith("Añadir") && { color: colors.primary, fontWeight: 'bold' }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  tagText: { fontSize: 13, fontWeight: '600', marginRight: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12 },
  input: { flex: 1, height: 45, fontSize: 14 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownText: { marginLeft: 10, fontSize: 14, color: '#333' }
});