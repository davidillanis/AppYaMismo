import { UserEntity } from '@/src/domain/entities/UserEntity';
import { useMemo, useState } from 'react';

export type FilterStatus = 'all' | 'active' | 'inactive';
export type SortOption = 'name' | 'email' | 'role' | 'status';

export interface UserFilters {
  search: string;
  status: FilterStatus;
  role: string;
  sortBy: SortOption;
}

export const useUserFilters = (users: UserEntity[]) => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    sortBy: 'name'
  });

  // Filtrar y ordenar usuarios
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filtro de búsqueda
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.roles?.some(role => 
          (role as any).role?.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Filtro de estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.enabled : !user.enabled
      );
    }

    // Filtro de rol
    if (filters.role !== 'all') {
      filtered = filtered.filter(user =>
        user.roles?.some(role => (role as any).role === filters.role)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'role':
          const aRole = a.roles?.[0] ? (a.roles[0] as any).role : '';
          const bRole = b.roles?.[0] ? (b.roles[0] as any).role : '';
          return aRole.localeCompare(bRole);
        case 'status':
          return (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, filters]);

  // Actualizar filtro específico
  const updateFilter = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      sortBy: 'name'
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return filters.search.trim() || 
           filters.status !== 'all' || 
           filters.role !== 'all';
  }, [filters]);

  return {
    filters,
    filteredUsers,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalUsers: users.length,
    filteredCount: filteredUsers.length
  };
};