import React, { ReactNode } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareWrapperProps {
  children: ReactNode;
  extraScrollHeight?: number;
  contentContainerStyle?: any;
}

const KeyboardAwareWrapper: React.FC<KeyboardAwareWrapperProps> = ({
  children,
  extraScrollHeight = Platform.OS === 'ios' ? 24 : 0,
  contentContainerStyle,
}) => {
  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      enableOnAndroid
      extraScrollHeight={extraScrollHeight}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 16 },
});

export default KeyboardAwareWrapper; 