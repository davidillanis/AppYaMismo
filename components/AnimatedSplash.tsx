import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const motoPosition = useSharedValue(-150);
  const progress = useSharedValue(0);
  const [percent, setPercent] = useState(0);
  const float = useSharedValue(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

  useAnimatedReaction(
    () => Math.round(progress.value),
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) runOnJS(setPercent)(currentValue);
    }
  );

  useEffect(() => {
    let isMounted = true;

    async function playSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/intro.mp3'),
          { shouldPlay: true }
        );
        if (isMounted) setSound(sound);
      } catch (error) {
        console.warn('Error reproduciendo sonido:', error);
      }
    }

    playSound();

    motoPosition.value = withRepeat(
      withTiming(width + 150, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    progress.value = withTiming(100, { duration: 3000 }, (finished) => {
      if (finished) runOnJS(onFinish)();
    });

    float.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    return () => {
      isMounted = false;
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  const motoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: motoPosition.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const floatStyle = useAnimatedStyle(() => {
    const translateY = Math.sin(float.value * 2 * Math.PI) * 10;
    return { transform: [{ translateY }] };
  });

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={styles.container}>
      {/* 🔹 Imagen de fondo */}
      <ImageBackground
        source={require('../assets/images/fondo.jpg')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        {/* 🔹 Contenido central (logo flotante + versión) */}
        <View style={styles.centerContent}>
          <Animated.Image
            source={require('../assets/images/logo2.png')}
            style={[styles.logo, floatStyle]}
            resizeMode="contain"
          />
          <Text style={styles.versionText}>Versión {appVersion}</Text>
        </View>

        {/* 🔹 Moto animada */}
        <Animated.View style={[styles.motoContainer, motoStyle]} />

        {/* 🔹 Barra de carga */}
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>
          <Text style={styles.loadingText}>Cargando... {percent}%</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: -10,
  },
  versionText: {
    marginTop: 10,
    color: 'rgba(199, 199, 199, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3, 
  },
  motoContainer: {
    position: 'absolute',
    top: '45%',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '70%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E4DABF',
  },
  loadingText: {
    color: '#E4DABF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});

