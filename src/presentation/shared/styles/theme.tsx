// Tema de colores para App Qawary Oruro - Municipalidad de Oruro
// Inspirado en los colores de la EMAO y entidades municipales de Oruro
//src/presentation/shared/styles/theme.tsx
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const lightTheme = {
  colors: {
    // Colores primarios - Identidad municipal
    primary: "#A4243B",
    primaryLight: "#D8C99B",
    primaryDark: "#1E40AF",

    // Colores secundarios - Acentos
    secondary: "#2D2D2D",
    secondaryLight: "#10B981",
    secondaryDark: "#047857",

    // Colores terciarios - Complementarios
    tertiary: "#D97706",
    tertiaryLight: "#F59E0B",
    tertiaryDark: "#B45309",

    // Fondos y superficies
    background: "#E4DABF",
    surface: "#ccc0a1",
    surfaceVariant: "#273E47",

    // Textos
    text: "#0F172A",
    textSecondary: "#475569",
    textTertiary: "#000000",
    textInverse: "#FFFFFF",

    // Bordes y divisores
    border: "#2D2D2D",
    borderVariant: "#CBD5E1",

    // Estados del sistema
    success: "#0A9C07",
    successLight: "#D1FAE5",
    warning: "#D97706",
    warningLight: "#FEF3C7",
    error: "#DC2626",
    errorLight: "#FEE2E2",
    info: "#2563EB",
    infoLight: "#DBEAFE",

    // Componentes específicos
    card: "#eefaf1ff",
    button: "#2D2D2D",
    buttonSecondary: "#626267",
    icon: "#475569",
    tabIcon: "#64748B",
    tabIconSelected: "#908461",
  },
  fonts: {
    primary: "Roboto",
    secondary: "Inter",
    tertiary: "Copperplate",
  },
};

export const darkTheme = {
  colors: {
    // Colores primarios - Identidad municipal
    primary: "#A4243B",
    primaryLight: "#93C5FD",
    primaryDark: "#3B82F6",

    // Colores secundarios - Acentos
    secondary: "#D8973C",
    secondaryLight: "#6EE7B7",
    secondaryDark: "#10B981",

    // Colores terciarios - Complementarios
    tertiary: "#273E47",
    tertiaryLight: "#FCD34D",
    tertiaryDark: "#F59E0B",

    // Fondos y superficies
    background: "#2D2D2D",
    surface: "#535353",
    surfaceVariant: "#E4DABF",

    // Textos
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textTertiary: "#FFFFFF",
    textInverse: "#0F172A",

    // Bordes y divisores
    border: "#A4243B",
    borderVariant: "#475569",

    // Estados del sistema
    success: "#2AF527",
    successLight: "#064E3B",
    warning: "#FBBF24",
    warningLight: "#451A03",
    error: "#F87171",
    errorLight: "#450A0A",
    info: "#2196F3",
    infoLight: "#1E3A8A",

    // Componentes específicos
    card: "#CBD4C2",
    button: "#D8C99B",
    buttonSecondary: "#C9C9C9",
    icon: "#CBD5E1",
    tabIcon: "#94A3B8",
    tabIconSelected: "#C4A676",
  },
  fonts: {
    primary: "Roboto",
    secondary: "Inter",
    tertiary: "Copperplate",
  },
};

export const normalTheme = {
  colors: {
    // Colores primarios - Identidad municipal
    primary: "#2563EB",
    primaryLight: "#3B82F6",
    primaryDark: "#1D4ED8",

    // Colores secundarios - Acentos
    secondary: "#10B981",
    secondaryLight: "#34D399",
    secondaryDark: "#059669",

    // Colores terciarios - Complementarios
    tertiary: "#F59E0B",
    tertiaryLight: "#FBBF24",
    tertiaryDark: "#D97706",

    // Fondos y superficies
    background: "#273E47",
    surface: "#FFFFFF",
    surfaceVariant: "#F1F5F9",

    // Textos
    text: "#1E293B",
    textSecondary: "#475569",
    textTertiary: "#64748B",
    textInverse: "#FFFFFF",

    // Bordes y divisores
    border: "#E2E8F0",
    borderVariant: "#CBD5E1",

    // Estados del sistema
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    // Componentes específicos
    card: "#FFFFFF",
    button: "#2563EB",
    buttonSecondary: "#334155",
    icon: "#475569",
    tabIcon: "#64748B",
    tabIconSelected: "#2563EB",
  },
  fonts: {
    primary: "Roboto",
    secondary: "Inter",
    tertiary: "Copperplate",
  },
};

export type Theme = typeof lightTheme;
export type ThemeMode = "light" | "dark" | "normal";

export const getTheme = (mode: ThemeMode): Theme => {
  switch (mode) {
    case "light":
      return lightTheme;
    case "dark":
      return darkTheme;
    case "normal":
      return normalTheme;
    default:
      return lightTheme;
  }
};

// Constantes de accesibilidad WCAG
export const accessibility = {
  // Ratios de contraste mínimos recomendados
  contrastRatios: {
    normal: 4.5,
    large: 3.0,
    ui: 3.0,
  },
  // Colores de alto contraste para accesibilidad
  highContrast: {
    text: "#000000",
    background: "#FFFFFF",
    link: "#0066CC",
    focus: "#FF6B35",
  },
};

// Guía de uso por componente
export const componentUsage = {
  // Botones
  button: {
    primary: "colors.button",
    secondary: "colors.buttonSecondary",
    success: "colors.success",
    warning: "colors.warning",
    error: "colors.error",
  },
  // Tarjetas
  card: {
    background: "colors.card",
    border: "colors.border",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  // Textos
  text: {
    primary: "colors.text",
    secondary: "colors.textSecondary",
    tertiary: "colors.textTertiary",
    inverse: "colors.textInverse",
  },
  // Estados
  status: {
    success: "colors.success",
    warning: "colors.warning",
    error: "colors.error",
    info: "colors.info",
  },
};

export const createStyles = (
  colors: typeof Colors.light,
  normalize: (n: number) => number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1 },
    header: {
      paddingVertical: normalize(16),
      paddingHorizontal: normalize(20),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: normalize(4),
    },
    headerButton: {
      padding: normalize(10),
      borderRadius: normalize(12),
      backgroundColor: "rgba(250,250,250,0.2)",
    },
    headerTitle: {
      fontSize: normalize(20),
      fontWeight: "700",
      color: colors.textInverse,
      flex: 1,
      textAlign: "center",
      fontFamily: colors.fontPrimary,
    },
    headerActions: {
      flexDirection: "row",
      gap: normalize(8),
    },
    addButton: {
      padding: normalize(10),
      borderRadius: normalize(12),
      backgroundColor: colors.secondary,
    },
    resultsHeader: {
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(8),
    },
    resultsCount: {
      fontSize: normalize(14),
      color: colors.textSecondary,
      fontWeight: "500",
      fontFamily: colors.fontSecondary,
    },
    errorText: {
      fontSize: normalize(12),
      color: colors.error,
      fontWeight: "500",
      marginTop: normalize(2),
      fontFamily: colors.fontSecondary,
    },
    lastUpdateText: {
      fontSize: normalize(12),
      color: colors.textTertiary,
      fontStyle: "italic",
      marginTop: normalize(2),
      fontFamily: colors.fontSecondary,
    },
    usersList: {
      paddingHorizontal: normalize(16),
      paddingBottom: normalize(20),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: normalize(60),
    },
    loadingText: {
      marginTop: normalize(16),
      fontSize: normalize(16),
      color: colors.textSecondary,
      fontFamily: colors.fontSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: normalize(32),
    },
    emptyTitle: {
      fontSize: normalize(20),
      fontWeight: "600",
      color: colors.text,
      marginTop: normalize(16),
      marginBottom: normalize(8),
      fontFamily: colors.fontPrimary,
    },
    emptyText: {
      fontSize: normalize(16),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: normalize(24),
      fontFamily: colors.fontSecondary,
    },
    clearButton: {
      paddingHorizontal: normalize(20),
      paddingVertical: normalize(10),
      backgroundColor: colors.primary,
      borderRadius: normalize(8),
      marginBottom: normalize(8),
    },
    reloadButton: {
      backgroundColor: colors.secondary,
    },
    clearButtonText: {
      color: colors.textInverse,
      fontWeight: "500",
      fontFamily: colors.fontSecondary,
    },
    loadingFooter: {
      alignItems: "center",
      paddingVertical: normalize(20),
    },
    loadingFooterText: {
      marginTop: normalize(8),
      fontSize: normalize(14),
      color: colors.textSecondary,
      fontFamily: colors.fontSecondary,
    },
    loadMoreButton: {
      alignItems: "center",
      paddingVertical: normalize(16),
      marginVertical: normalize(8),
      backgroundColor: colors.surface,
      borderRadius: normalize(8),
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadMoreText: {
      fontSize: normalize(14),
      color: colors.primary,
      fontWeight: "500",
      fontFamily: colors.fontSecondary,
    },
    endText: {
      textAlign: "center",
      fontSize: normalize(14),
      color: colors.textTertiary,
      paddingVertical: normalize(16),
      fontStyle: "italic",
      fontFamily: colors.fontSecondary,
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: normalize(12),
      paddingHorizontal: normalize(12),
      marginBottom: normalize(16),
      marginTop: normalize(16),
      borderWidth: 1,
      borderColor: colors.border,
    },

    searchIcon: {
      marginRight: normalize(8),
    },
    searchInput: {
      flex: 1,
      fontSize: normalize(16),
      color: colors.text,
      fontFamily: colors.fontPrimary,
      paddingVertical: normalize(10),
    },

  });
