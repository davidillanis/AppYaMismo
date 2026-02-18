import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const Welcome: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];

  // 🔗 Solo el ID del video, no la URL completa
  const videoId = 'vnII48b0r7U';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCCAA1" />

      {/* Fondo con degradado */}
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.content}>
        {/* Imagen del tutorial (por ahora en lugar de video) */}
        <Image
          source={require('@/assets/images/icono.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>
          Tutorial de cómo pedir en Ya Mismo
        </Text>

        <TouchableOpacity
          style={[styles.buttonContainer]}
          onPress={() => router.replace('/login')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>EMPEZAR</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCCAA1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  videoContainer: {
    width: width * 0.9,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  tutorialText: {
    fontSize: 14,
    color: '#002B1E',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '90%',
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  buttonPressed: {
    backgroundColor: '#5a67d8',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Welcome;
