import { Colors } from '@/constants/Colors';
import { UserEntity } from '@/src/domain/entities/UserEntity';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export type FilterStatus = 'all' | 'active' | 'inactive';
export type SortOption = 'name' | 'email' | 'role' | 'status';

export interface UserFilters {
  search: string;
  status: FilterStatus;
  role: string;
  sortBy: SortOption;
}

interface UserSearchFiltersProps {
  filters: UserFilters;
  users: UserEntity[];
  onFilterChange: (key: keyof UserFilters, value: any) => void;
  onClearFilters: () => void;
  colors: typeof Colors.light;
  normalize: (size: number) => number;
}

export const UserSearchFilters: React.FC<UserSearchFiltersProps> = ({
  filters,
  users,
  onFilterChange,
  onClearFilters,
  colors,
  normalize,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const styles = createStyles(colors, normalize);

  // Obtener roles disponibles
  const availableRoles = useMemo(() => {
    const roleSet = new Set<string>();
    users.forEach(user => {
      user.roles?.forEach(role => {
        roleSet.add((role as any).role || 'Sin Rol');
      });
    });
    return Array.from(roleSet);
  }, [users]);

  const hasActiveFilters = filters.search.trim() || filters.status !== 'all' || filters.role !== 'all';

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={normalize(20)} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          placeholderTextColor={colors.textTertiary}
          value={filters.search}
          onChangeText={(text) => onFilterChange('search', text)}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity
            onPress={() => onFilterChange('search', '')}
          >
            <Ionicons name="close-circle" size={normalize(20)} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Botón de filtros */}
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options" 
            size={normalize(18)} 
            color={showFilters ? colors.textInverse : colors.primary} 
          />
          <Text style={[
            styles.filterToggleText,
            showFilters && styles.filterToggleTextActive
          ]}>
            Filtros
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Ionicons name="refresh" size={normalize(16)} color={colors.textSecondary} />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Panel de filtros */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Filtro de estado */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Estado</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'active', label: 'Activos' },
                { key: 'inactive', label: 'Inactivos' }
              ].map((status) => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.filterButton,
                    filters.status === status.key && styles.filterButtonActive
                  ]}
                  onPress={() => onFilterChange('status', status.key)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.status === status.key && styles.filterButtonTextActive
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro de rol */}
          {availableRoles.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Rol</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filters.role === 'all' && styles.filterButtonActive
                    ]}
                    onPress={() => onFilterChange('role', 'all')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filters.role === 'all' && styles.filterButtonTextActive
                    ]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {availableRoles.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.filterButton,
                        filters.role === role && styles.filterButtonActive
                      ]}
                      onPress={() => onFilterChange('role', role)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        filters.role === role && styles.filterButtonTextActive
                      ]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Filtro de ordenamiento */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Ordenar por</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'name', label: 'Nombre' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Rol' },
                { key: 'status', label: 'Estado' }
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterButton,
                    filters.sortBy === sort.key && styles.filterButtonActive
                  ]}
                  onPress={() => onFilterChange('sortBy', sort.key)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.sortBy === sort.key && styles.filterButtonTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (
  colors: typeof Colors.light,
  normalize: (n: number) => number
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingHorizontal: normalize(16),
      paddingTop: normalize(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(12),
      marginBottom: normalize(12),
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: normalize(8),
      fontSize: normalize(16),
      color: colors.text,
      fontFamily: colors.fontSecondary,
    },
    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: normalize(12),
    },
    filterToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(8),
      borderRadius: normalize(8),
      borderWidth: 1,
      borderColor: colors.primary,
    },
    filterToggleActive: {
      backgroundColor: colors.primary,
    },
    filterToggleText: {
      marginLeft: normalize(6),
      fontSize: normalize(14),
      fontWeight: '500',
      color: colors.primary,
      fontFamily: colors.fontSecondary,
    },
    filterToggleTextActive: {
      color: colors.textInverse,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(8),
      backgroundColor: colors.surface,
      borderRadius: normalize(8),
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButtonText: {
      marginLeft: normalize(4),
      fontSize: normalize(12),
      color: colors.textSecondary,
      fontFamily: colors.fontTertiary,
    },
    filtersPanel: {
      backgroundColor: colors.card,
      borderRadius: normalize(12),
      padding: normalize(16),
      marginBottom: normalize(16),
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterSection: {
      marginBottom: normalize(16),
    },
    filterLabel: {
      fontSize: normalize(14),
      fontWeight: '600',
      color: colors.text,
      marginBottom: normalize(8),
      fontFamily: colors.fontPrimary,
    },
    filterButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: normalize(8),
    },
    filterButton: {
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(6),
      borderRadius: normalize(16),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: normalize(12),
      fontWeight: '500',
      color: colors.textSecondary,
      fontFamily: colors.fontTertiary,
    },
    filterButtonTextActive: {
      color: colors.textInverse,
    },
  });