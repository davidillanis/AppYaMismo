# Guía de Tema de Colores - App Qawary Oruro

## Descripción General

Este tema de colores está diseñado específicamente para la app móvil de la Municipalidad de Oruro, inspirado en los colores de la EMAO (Escuela Municipal de Arte Oruro) y entidades municipales de la región. Combina profesionalismo municipal con modernidad tecnológica.

## Paleta de Colores por Modo

### 🟦 **MODO CLARO (Light Theme)**
**Identidad Municipal:**
- **Primary**: `#1E3A8A` - Azul municipal profundo (botones principales, headers)
- **Primary Light**: `#3B82F6` - Azul municipal claro (hover, estados activos)
- **Primary Dark**: `#1E40AF` - Azul municipal oscuro (textos importantes)

**Acentos:**
- **Secondary**: `#059669` - Verde esmeralda (reciclaje, éxito, acciones positivas)
- **Secondary Light**: `#10B981` - Verde claro (estados de éxito, indicadores)
- **Secondary Dark**: `#047857` - Verde oscuro (textos de éxito)

**Complementarios:**
- **Tertiary**: `#D97706` - Dorado (riqueza minera, advertencias)
- **Tertiary Light**: `#F59E0B` - Dorado claro (destacados, llamadas a la acción)
- **Tertiary Dark**: `#B45309` - Dorado oscuro (textos de advertencia)

### 🌙 **MODO OSCURO (Dark Theme)**
**Identidad Municipal:**
- **Primary**: `#60A5FA` - Azul municipal claro (adaptado para fondos oscuros)
- **Primary Light**: `#93C5FD` - Azul municipal más claro (hover, estados activos)
- **Primary Dark**: `#3B82F6` - Azul municipal estándar (textos importantes)

**Acentos:**
- **Secondary**: `#34D399` - Verde esmeralda claro (reciclaje, éxito)
- **Secondary Light**: `#6EE7B7` - Verde más claro (estados de éxito)
- **Secondary Dark**: `#10B981` - Verde estándar (textos de éxito)

**Complementarios:**
- **Tertiary**: `#FBBF24` - Dorado claro (advertencias, destacados)
- **Tertiary Light**: `#FCD34D` - Dorado más claro (llamadas a la acción)
- **Tertiary Dark**: `#F59E0B` - Dorado estándar (textos de advertencia)

### 🌤️ **MODO NORMAL/INTERMEDIO (Normal Theme)**
**Identidad Municipal:**
- **Primary**: `#2563EB` - Azul municipal intermedio (balance entre claro y oscuro)
- **Primary Light**: `#3B82F6` - Azul municipal claro
- **Primary Dark**: `#1D4ED8` - Azul municipal oscuro

**Acentos:**
- **Secondary**: `#10B981` - Verde esmeralda intermedio
- **Secondary Light**: `#34D399` - Verde claro
- **Secondary Dark**: `#059669` - Verde oscuro

**Complementarios:**
- **Tertiary**: `#F59E0B` - Dorado intermedio
- **Tertiary Light**: `#FBBF24` - Dorado claro
- **Tertiary Dark**: `#D97706` - Dorado oscuro

## 🎨 **Aplicación por Componente**

### **Botones**
```typescript
// Botón primario
backgroundColor: theme.colors.button
color: theme.colors.textInverse

// Botón secundario
backgroundColor: theme.colors.buttonSecondary
color: theme.colors.text

// Botón de éxito
backgroundColor: theme.colors.success
color: theme.colors.textInverse

// Botón de advertencia
backgroundColor: theme.colors.warning
color: theme.colors.textInverse

// Botón de error
backgroundColor: theme.colors.error
color: theme.colors.textInverse
```

### **Tarjetas**
```typescript
// Fondo de tarjeta
backgroundColor: theme.colors.card

// Borde de tarjeta
borderColor: theme.colors.border

// Sombra (opcional)
shadowColor: 'rgba(0, 0, 0, 0.1)'
```

### **Textos**
```typescript
// Texto principal
color: theme.colors.text

// Texto secundario
color: theme.colors.textSecondary

// Texto terciario
color: theme.colors.textTertiary

// Texto sobre fondos oscuros
color: theme.colors.textInverse
```

### **Estados del Sistema**
```typescript
// Éxito
color: theme.colors.success
backgroundColor: theme.colors.successLight

// Advertencia
color: theme.colors.warning
backgroundColor: theme.colors.warningLight

// Error
color: theme.colors.error
backgroundColor: theme.colors.errorLight

// Información
color: theme.colors.info
backgroundColor: theme.colors.infoLight
```

## 🚀 **Implementación en React Native**

### **1. Importar el tema**
```typescript
import { lightTheme, darkTheme, normalTheme, getTheme } from '@/styles/theme';
```

### **2. Usar con hook personalizado**
```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Contenido de la app
      </Text>
    </View>
  );
}
```

### **3. Cambiar entre temas**
```typescript
import { getTheme } from '@/styles/theme';

const currentTheme = getTheme('light'); // 'light' | 'dark' | 'normal'
```

## 📱 **Casos de Uso Específicos**

### **Módulo de Funcionarios**
- **Headers**: `theme.colors.primary`
- **Botones de acción**: `theme.colors.secondary`
- **Estados de camiones**: `theme.colors.info`

### **Módulo de Operarios**
- **Rutas activas**: `theme.colors.success`
- **Ubicación GPS**: `theme.colors.primary`
- **Alertas**: `theme.colors.warning`

### **Módulo de Vecinos**
- **Información educativa**: `theme.colors.info`
- **Horarios**: `theme.colors.secondary`
- **Notificaciones**: `theme.colors.tertiary`

## ♿ **Accesibilidad WCAG**

### **Ratios de Contraste Mínimos**
- **Texto normal**: 4.5:1
- **Texto grande (18pt+)**: 3:1
- **Elementos de UI**: 3:1

### **Colores de Alto Contraste**
```typescript
import { accessibility } from '@/styles/theme';

// Para usuarios con problemas de visión
const highContrastText = accessibility.highContrast.text;
const highContrastBackground = accessibility.highContrast.background;
```

## 🔧 **Personalización**

### **Agregar nuevos colores**
```typescript
// En el tema
export const lightTheme = {
  colors: {
    // ... colores existentes
    custom: '#FF6B35', // Nuevo color personalizado
  }
};
```

### **Crear variantes**
```typescript
// Variantes de un color
export const colorVariants = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    900: '#1E3A8A',
  }
};
```

## 📋 **Checklist de Implementación**

- [ ] Importar temas en componentes principales
- [ ] Aplicar colores de fondo y texto
- [ ] Configurar colores de botones y tarjetas
- [ ] Implementar estados del sistema
- [ ] Verificar contraste de accesibilidad
- [ ] Probar en modo claro, oscuro y normal
- [ ] Documentar uso en componentes nuevos

## 🎯 **Mejores Prácticas**

1. **Consistencia**: Usar siempre los colores del tema, no hardcodear
2. **Semántica**: Aplicar colores según su significado (éxito = verde, error = rojo)
3. **Accesibilidad**: Verificar contraste antes de implementar
4. **Responsive**: Adaptar colores según el modo del sistema
5. **Performance**: Evitar recrear estilos en cada render

---

*Desarrollado para la Municipalidad de Oruro - App Qawary Oruro*
*Versión 1.0 - Sistema de Gestión de Residuos* 