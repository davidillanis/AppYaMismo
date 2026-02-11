import { AppColorScheme, Colors } from "@/constants/Colors";
import { ComboBoxItem } from "@/src/domain/types/ComboBox";
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type MultiComboBoxProps = {
  value: string[]; // 🔄 CAMBIO: ahora acepta múltiples valores
  onChange: (selectedValues: string[]) => void;
  label?: string;
  placeholder?: string;
  items?: ComboBoxItem[];
  fetchItems?: () => Promise<ComboBoxItem[]>;
  loading?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  clearable?: boolean;
  noDataText?: string;
  noResultsText?: string;
  searchPlaceholder?: string;
};

const MultiComboBox: React.FC<MultiComboBoxProps> = ({
  value,
  onChange,
  label,
  placeholder = "Seleccionar...",
  items,
  fetchItems,
  loading: externalLoading,
  error,
  required = false,
  disabled = false,
  searchable = false,
  maxHeight = SCREEN_HEIGHT * 0.5,
  clearable = false,
  noDataText = "No hay opciones disponibles",
  noResultsText = "No se encontraron resultados",
  searchPlaceholder = "Buscar..."
}) => {
  const [internalItems, setInternalItems] = useState<ComboBoxItem[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const colorScheme = useColorScheme() as AppColorScheme;
  const colors = Colors[colorScheme || 'normal'];

  useEffect(() => {
    const keyboardShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  const loadItems = useCallback(async () => {
    if (!fetchItems) return;
    setInternalLoading(true);
    try {
      const data = await fetchItems();
      setInternalItems(data);
    } catch {
      setInternalItems([]);
    } finally {
      setInternalLoading(false);
    }
  }, [fetchItems]);

  useEffect(() => {
    if (items) setInternalItems(items);
    else if (fetchItems) loadItems();
  }, [items, loadItems, fetchItems]);

  const filteredItems = useMemo(() => {
    if (!searchable || !searchText.trim()) return internalItems;
    const query = searchText.toLowerCase().trim();
    return internalItems.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.value.toLowerCase().includes(query)
    );
  }, [searchText, internalItems, searchable]);

  // 🔄 CAMBIO: ahora buscamos múltiples seleccionados
  const selectedItems = useMemo(() => {
    return internalItems.filter(item => value.includes(item.value));
  }, [internalItems, value]);

  const isLoading = externalLoading || internalLoading;

  // 🔄 CAMBIO: seleccionar/deseleccionar sin cerrar modal
  const handleItemSelect = useCallback((selectedValue: string) => {
    let newValues: string[];
    if (value.includes(selectedValue)) {
      newValues = value.filter(v => v !== selectedValue);
    } else {
      newValues = [...value, selectedValue];
    }
    onChange(newValues);
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange([]);
    setModalVisible(false);
    setSearchText('');
    Keyboard.dismiss();
  }, [onChange]);

  const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    required: { color: colors.error, marginLeft: 4 },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 52,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    selectorDisabled: { backgroundColor: colors.border + '15' },
    selectedText: { fontSize: 16, color: colors.text, flex: 1 },
    placeholderText: { fontSize: 16, color: colors.textTertiary, flex: 1 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    clearButton: { padding: 4, marginRight: 8 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      maxHeight: maxHeight - keyboardHeight,
      width: '100%',
      alignSelf: 'center',
    },
    modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    searchInput: { flex: 1, paddingVertical: 8, fontSize: 15, color: colors.text },
    modalList: { flexGrow: 0 },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    modalItemSelected: { backgroundColor: colors.primary + '10' },
    modalItemText: { fontSize: 15, color: colors.text, flex: 1 },
    modalItemTextSelected: { color: colors.primary, fontWeight: '600' },
    modalItemDisabled: { opacity: 0.5 },
    emptyState: { padding: 32, alignItems: 'center' },
    emptyText: { fontSize: 15, color: colors.textTertiary, textAlign: 'center' },
    modalFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
    modalButton: { flex: 1, padding: 14, alignItems: 'center' },
    modalButtonText: { fontSize: 15, fontWeight: '600' },
    closeButtonText: { color: colors.textSecondary },
    clearButtonText: { color: colors.error },
    errorText: { fontSize: 12, color: colors.error, marginTop: 6 },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    loadingText: { fontSize: 16, color: colors.textTertiary, marginLeft: 12 },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={selectedItems.length > 0 ? styles.selectedText : styles.placeholderText}
          numberOfLines={1}
        >
          {selectedItems.length > 0
            ? selectedItems.map(item => item.label).join(", ")
            : placeholder}
        </Text>
        <View style={styles.actions}>
          {clearable && selectedItems.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
          <Ionicons
            name={modalVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Seleccionar opción"}</Text>
              {searchable && (
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={colors.textTertiary}
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <Ionicons name="close" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name={searchText ? "search" : "list"} size={40} color={colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {searchText ? noResultsText : noDataText}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.value}
                style={styles.modalList}
                showsVerticalScrollIndicator
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      value.includes(item.value) && styles.modalItemSelected,
                      item.disabled && styles.modalItemDisabled
                    ]}
                    onPress={() => !item.disabled && handleItemSelect(item.value)}
                    disabled={item.disabled}
                  >
                    <Text style={[
                      styles.modalItemText,
                      value.includes(item.value) && styles.modalItemTextSelected
                    ]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {value.includes(item.value) && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                initialNumToRender={20}
                maxToRenderPerBatch={30}
                windowSize={15}
                removeClippedSubviews={true}
                getItemLayout={(_, index) => ({
                  length: 48,
                  offset: 48 * index,
                  index,
                })}
              />
            )}
            <View style={styles.modalFooter}>
              {clearable && selectedItems.length > 0 && (
                <TouchableOpacity style={styles.modalButton} onPress={handleClear}>
                  <Text style={[styles.modalButtonText, styles.clearButtonText]}>Limpiar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.closeButtonText]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MultiComboBox;
