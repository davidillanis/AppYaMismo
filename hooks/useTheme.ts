import { getTheme, Theme, ThemeMode } from '@/src/presentation/shared/styles/theme';
import React from 'react';
import { useColorScheme } from 'react-native';

/**
 * Hook personalizado para usar el sistema de temas de Qawary Oruro
 * Combina el tema del sistema con la funcionalidad de tema personalizado
 */
export function useTheme(): Theme {
  const systemColorScheme = useColorScheme();
  
  // Determinar el tema basado en el esquema del sistema
  let themeMode: ThemeMode = 'normal';
  
  if (systemColorScheme === 'light') {
    themeMode = 'light';
  } else if (systemColorScheme === 'dark') {
    themeMode = 'dark';
  } else {
    themeMode = 'normal';
  }
  
  return getTheme(themeMode);
}

/**
 * Hook para obtener un tema específico
 * Útil para componentes que necesitan un tema particular
 */
export function useSpecificTheme(mode: ThemeMode): Theme {
  return getTheme(mode);
}

/**
 * Hook para alternar entre temas manualmente
 * Útil para funcionalidad de cambio de tema por el usuario
 */
export function useThemeToggle() {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeMode>('normal');
  
  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'normal'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };
  
  const setTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode);
  };
  
  return {
    currentTheme,
    theme: getTheme(currentTheme),
    toggleTheme,
    setTheme,
  };
}

/**
 * Hook para obtener colores de estado específicos
 * Simplifica el uso de colores para estados del sistema
 */
export function useStatusColors() {
  const theme = useTheme();
  
  return {
    success: {
      background: theme.colors.successLight,
      text: theme.colors.success,
      border: theme.colors.success,
    },
    warning: {
      background: theme.colors.warningLight,
      text: theme.colors.warning,
      border: theme.colors.warning,
    },
    error: {
      background: theme.colors.errorLight,
      text: theme.colors.error,
      border: theme.colors.error,
    },
    info: {
      background: theme.colors.infoLight,
      text: theme.colors.info,
      border: theme.colors.info,
    },
  };
}

/**
 * Hook para obtener colores de componentes comunes
 * Proporciona combinaciones de colores predefinidas para componentes
 */
export function useComponentColors() {
  const theme = useTheme();
  
  return {
    button: {
      primary: {
        background: theme.colors.button,
        text: theme.colors.textInverse,
        border: theme.colors.button,
      },
      secondary: {
        background: theme.colors.buttonSecondary,
        text: theme.colors.text,
        border: theme.colors.border,
      },
      success: {
        background: theme.colors.success,
        text: theme.colors.textInverse,
        border: theme.colors.success,
      },
      warning: {
        background: theme.colors.warning,
        text: theme.colors.textInverse,
        border: theme.colors.warning,
      },
      error: {
        background: theme.colors.error,
        text: theme.colors.textInverse,
        border: theme.colors.error,
      },
    },
    card: {
      background: theme.colors.card,
      border: theme.colors.border,
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    input: {
      background: theme.colors.surface,
      border: theme.colors.border,
      text: theme.colors.text,
      placeholder: theme.colors.textTertiary,
    },
    tab: {
      background: theme.colors.surface,
      active: theme.colors.tabIconSelected,
      inactive: theme.colors.tabIcon,
    },
  };
}

// Re-exportar tipos para uso externo
export type { Theme, ThemeMode } from '@/src/presentation/shared/styles/theme';
