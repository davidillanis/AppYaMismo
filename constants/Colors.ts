import { MappedPalette } from '@/src/domain/types/MappedPalette';
import { darkTheme, lightTheme, normalTheme } from '@/src/presentation/shared/styles/theme';

const mapTheme = (t: typeof lightTheme): MappedPalette => ({
  text: t.colors.text,
  textSecondary: t.colors.textSecondary,
  textTertiary: t.colors.textTertiary,
  textInverse: t.colors.textInverse,

  background: t.colors.background,
  surface: t.colors.surface,
  surfaceVariant: t.colors.surfaceVariant,
  card: t.colors.card,

  icon: t.colors.icon,
  tabIconDefault: t.colors.tabIcon,
  tabIconSelected: t.colors.tabIconSelected,

  primary: t.colors.primary,
  secondary: t.colors.secondary,
  tertiary: t.colors.primary,

  border: t.colors.border,
  borderVariant: t.colors.borderVariant,

  success: t.colors.success,
  successLight: t.colors.successLight,
  warning: t.colors.warning,
  warningLight: t.colors.warningLight,
  error: t.colors.error,
  errorLight: t.colors.errorLight,
  info: t.colors.info,
  infoLight: t.colors.infoLight,

  button: t.colors.button,
  buttonSecondary: t.colors.buttonSecondary,

  fontPrimary: t.fonts.primary,
  fontSecondary: t.fonts.secondary,
  fontTertiary: t.fonts.tertiary,
});

export const Colors = {
  light: mapTheme(lightTheme),
  dark: mapTheme(darkTheme),
  normal: mapTheme(normalTheme),
};

export type AppColorScheme = keyof typeof Colors;
