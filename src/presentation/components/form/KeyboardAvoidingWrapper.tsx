import React, { ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  contentContainerStyle?: any;
  /**
   * Cuando true, envuelve el contenido en un ScrollView con bounce deshabilitado.
   * Útil si el contenido puede crecer un poco pero no amerita KeyboardAware.
   */
  enableSmallScroll?: boolean;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  behavior = Platform.select({ ios: 'padding', android: 'height' }) as 'padding' | 'height' | 'position',
  contentContainerStyle,
  enableSmallScroll = false,
}) => {
  const Container = enableSmallScroll ? ScrollView : View;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={behavior} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <Container
          contentContainerStyle={enableSmallScroll ? [styles.container, contentContainerStyle] : undefined}
          style={!enableSmallScroll ? [styles.container, contentContainerStyle] : undefined}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {children}
        </Container>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 16 },
});

export default KeyboardAvoidingWrapper; 