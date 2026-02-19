import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const Welcome: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];

  // 🎥 Nuevo video
  const videoId = 'jPSdpXr7j1A';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCCAA1" />

      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.content}>
        {/* 🎥 Video centrado y recortado */}
        <View style={styles.videoCropContainer}>
          <View style={styles.videoInner}>
            <YoutubePlayer
              height={310}
              width={Dimensions.get('window').width * 1.5} // más ancho para recortar laterales
              videoId={videoId}
              play={false}
              webViewProps={{
                allowsFullscreenVideo: true,
                javaScriptEnabled: true,
              }}
            />
          </View>
        </View>

        <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>
          Tutorial de cómo pedir en YaMismo
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
  // 🔍 Recorte central del video
  videoCropContainer: {
    width: width * 0.7,     // visible solo el centro
    height: 540,            // altura visible
    overflow: 'hidden',     // corta lo que sobresale
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  // Mueve y escala el video dentro del contenedor
  videoInner: {
    transform: [
      { scale: 1.8 },       // zoom al centro
      { translateX: -width * 0 }, // mueve un poco a la izquierda o derecha según necesites
      { translateY: 0 },    // ajusta si necesitas moverlo verticalmente
    ],
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
    width: 150,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Welcome;
