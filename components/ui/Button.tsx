import { useComponentColors } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  title: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  title, 
  style, 
  ...props 
}: ButtonProps) {
  const colors = useComponentColors();
  const buttonColors = colors.button[variant];
  
  const buttonStyle = [
    styles.button,
    styles[size],
    {
      backgroundColor: buttonColors.background,
      borderColor: buttonColors.border,
    },
    style,
  ];
  
  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    {
      color: buttonColors.text,
    },
  ];
  
  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
}); 