// src/presentation/components/LoaderScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

type Props = {
  ready?: boolean;
  onFinish?: () => void;
};

const LoaderScreen: React.FC<Props> = ({ ready = false, onFinish }) => {
  const [progress] = useState(new Animated.Value(0));
  const hasFinished = useRef(false);

  useEffect(() => {
    // Animación de barra de carga
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Cuando la animación termine y las fuentes estén listas, llamar a onFinish
    const timer = setTimeout(() => {
      if (ready && !hasFinished.current) {
        hasFinished.current = true;
        onFinish?.();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [progress, ready, onFinish]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCCAA1" />
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>entregando felicidad</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressBar, { width: widthInterpolated }]} />
        </View>
        <Text style={styles.loadingText}>Cargando ...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCCAA1', // fondo beige
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginTop: 8,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E96B2B',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LoaderScreen;