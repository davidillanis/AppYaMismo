import { Theme, useTheme } from '@/hooks/useTheme';
import { BaseToast, ToastProps } from "react-native-toast-message";
import { lightTheme } from "../styles/theme";

// Componente de toast que se adapta al tema actual
const ThemedToast = ({ 
  type, 
  theme, 
  ...props 
}: ToastProps & { theme: Theme; type: 'success' | 'error' | 'info' | 'warning' }) => {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: theme.colors.success,
          backgroundColor: theme.colors.successLight,
          textColor: theme.colors.success,
        };
      case 'error':
        return {
          borderColor: theme.colors.error,
          backgroundColor: theme.colors.errorLight,
          textColor: theme.colors.error,
        };
      case 'info':
        return {
          borderColor: theme.colors.info,
          backgroundColor: theme.colors.infoLight,
          textColor: theme.colors.info,
        };
      case 'warning':
        return {
          borderColor: theme.colors.warning,
          backgroundColor: theme.colors.warningLight,
          textColor: theme.colors.warning,
        };
      default:
        return {
          borderColor: theme.colors.info,
          backgroundColor: theme.colors.infoLight,
          textColor: theme.colors.info,
        };
    }
  };

  const config = getToastConfig();

  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        borderLeftWidth: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: config.textColor,
      }}
      text2Style={{
        fontSize: 13,
        color: theme.colors.text,
      }}
    />
  );
};

// Hook para crear la configuración de toast con tema dinámico
export const useToastConfig = () => {
  const theme = useTheme();
  
  return {
    success: (props: ToastProps) => (
      <ThemedToast {...props} type="success" theme={theme} />
    ),
    error: (props: ToastProps) => (
      <ThemedToast {...props} type="error" theme={theme} />
    ),
    info: (props: ToastProps) => (
      <ThemedToast {...props} type="info" theme={theme} />
    ),
    warning: (props: ToastProps) => (
      <ThemedToast {...props} type="warning" theme={theme} />
    ),
  };
};

const staticToastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: lightTheme.colors.success,
        backgroundColor: lightTheme.colors.successLight,
        borderLeftWidth: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: lightTheme.colors.success,
      }}
      text2Style={{
        fontSize: 13,
        color: lightTheme.colors.text,
      }}
    />
  ),
  
  error: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: lightTheme.colors.error,
        backgroundColor: lightTheme.colors.errorLight,
        borderLeftWidth: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: lightTheme.colors.error,
      }}
      text2Style={{
        fontSize: 13,
        color: lightTheme.colors.text,
      }}
    />
  ),
  
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: lightTheme.colors.info,
        backgroundColor: lightTheme.colors.infoLight,
        borderLeftWidth: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: lightTheme.colors.info,
      }}
      text2Style={{
        fontSize: 13,
        color: lightTheme.colors.text,
      }}
    />
  ),
  
  warning: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: lightTheme.colors.warning,
        backgroundColor: lightTheme.colors.warningLight,
        borderLeftWidth: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: lightTheme.colors.warning,
      }}
      text2Style={{
        fontSize: 13,
        color: lightTheme.colors.text,
      }}
    />
  ),
};

export default staticToastConfig;