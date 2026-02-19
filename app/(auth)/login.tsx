import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { KeyboardAwareWrapper } from '@/src/presentation/components/form';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


import Toast from 'react-native-toast-message';

const { height, width } = Dimensions.get('window');

// Fondo animado de emojis
const FallingEmojis = () => {
  const emojis = ['🍕', '🍔', '🍟', '🌭', '🍔', '🍗', '🍝', '🍹', '🥤', '🍖'];
  const emojiCount = 15;

  const Emoji = ({ index }: { index: number }) => {
    const fallAnim = useRef(new Animated.Value(0)).current;
    const randomLeft = Math.random() * width;
    const randomDuration = 5000 + Math.random() * 3000;
    const randomDelay = Math.random() * 3000;
    const randomSize = 15 + Math.random() * 10; // 👈 emojis pequeños
    const randomRotation = Math.random() > 0.5 ? 1 : -1; // sentido de giro aleatorio


    useEffect(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(fallAnim, {
            toValue: 1,
            duration: randomDuration,
            delay: randomDelay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(fallAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }, []);

    // Movimiento vertical
    const translateY = fallAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, height + 50],
    });

    // Rotación (ida y vuelta)
    const rotate = fallAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${randomRotation * 360}deg`],
    });

    return (
      <Animated.Text
        style={{
          position: 'absolute',
          top: 0,
          left: randomLeft,
          fontSize: randomSize,
          opacity: 0.85,
          transform: [{ translateY }, { rotate }],
        }}>
        {emojis[index % emojis.length]}
      </Animated.Text>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: emojiCount }).map((_, i) => (
        <Emoji key={i} index={i} />
      ))}
    </View>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];
  const { signIn, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animación de pestaña
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isLogin ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const positionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.7, // 👈 se reduce
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(positionAnim, {
          toValue: 40, // 👈 baja 20px (ajústalo a tu gusto)
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1, // 👈 tamaño normal
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(positionAnim, {
          toValue: 0, // 👈 posición original
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación que recorre 0 → 1 infinitamente
    Animated.loop(
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 6000, // duración total del ciclo (ajusta para velocidad)
        easing: Easing.linear, // movimiento constante
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const playSound = async (soundFile: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      // Liberar memoria después de reproducir
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Error reproduciendo sonido:', error);
    }
  };

  const onSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'warning',
        text1: 'Campos requeridos',
        text2: 'Por favor, ingresa tu correo y contraseña',
        visibilityTime: 3000,
        topOffset: 60,
      });
      await playSound(require('@/assets/sounds/error.mp3'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Correo inválido',
        text2: 'Por favor, ingresa un correo válido',
        visibilityTime: 3000,
        topOffset: 60,
      });
      await playSound(require('@/assets/sounds/error.mp3'));
      return;
    }

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        await playSound(require('@/assets/sounds/error.mp3'));
        Toast.show({
          type: 'error',
          text1: 'Error de autenticación',
          text2: result.error || 'Credenciales incorrectas. Intenta nuevamente.',
          visibilityTime: 4000,
          topOffset: 60,
        });
        return;
      }

      await playSound(require('@/assets/sounds/exito.mp3'));
    } catch (error) {
      console.log('Login error:', error);
      await playSound(require('@/assets/sounds/error.mp3'));
      Toast.show({
        type: 'error',
        text1: 'Error de autenticación',
        text2: 'Credenciales incorrectas. Intenta nuevamente.',
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  const onForgotPassword = () => {
    Toast.show({
      type: 'info',
      text1: 'Recuperar Contraseña',
      text2: 'Contacta al administrador del sistema',
      visibilityTime: 3000,
      topOffset: 60,
    });
  };

  const tabTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ✨ Efecto neón para el texto "Explorar sin iniciar sesión"
  const neonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(neonOpacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(neonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [neonOpacity]);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <FallingEmojis />

      <KeyboardAwareWrapper contentContainerStyle={styles.contentContainer}>
        {/* Botón atrás */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(auth)")}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    floatAnim.interpolate({
                      inputRange: [0, 0.20, 0.5, 0.75, 1],
                      outputRange: [0, -6, 0, 6, 0],
                    }),
                    positionAnim // 👈 se suma el movimiento del teclado
                  ),
                },
                { scale: scaleAnim }, // 👈 se mantiene la escala animada
              ],
            },
          ]}
        >
          <Image source={require('@/assets/images/logo2.png')} style={styles.logo} />
        </Animated.View>

        {/* Tabs animadas */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.activeTabBackground,
              { backgroundColor: colors.primary, transform: [{ translateX: tabTranslate }] },
            ]}
          />
          <TouchableOpacity style={styles.tabButton} onPress={() => setIsLogin(true)}>
            <Text style={[styles.tabText, { color: colors.textTertiary }, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => setIsLogin(false)}>
            <Text style={[styles.tabText, { color: colors.textTertiary }, !isLogin && styles.activeTabText]}>Registro</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {isLogin ? (
          <View style={styles.formContainer}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>BIENVENIDO</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ingrese sus credenciales para acceder</Text>

            {/* Campo correo */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Correo"
                style={styles.input}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            {/* Campo contraseña */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* ¿Olvidaste tu contraseña? */}
            <TouchableOpacity onPress={() => router.navigate('/ForgotPassword')}>
              <Text style={[styles.forgotPassword, { color: colors.textSecondary }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón Iniciar sesión */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary, opacity: isLoading ? 0.8 : 1 },
              ]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Explorar sin sesión */}
            <TouchableOpacity
              onPress={() => router.replace("../(client)/")}
              style={styles.exploreContainer}
            >
              <Animated.Text
                style={[
                  styles.exploreText,
                  {
                    opacity: neonOpacity,
                    color: '#D97706', // color neón 💙
                    textShadowColor: '#D97706',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 15,
                  },
                ]}
              >
                <Ionicons name="restaurant-outline" size={14} />  Explorar sin iniciar sesión
              </Animated.Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>CREAR CUENTA</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Regístrate para comenzar</Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.replace('/register')}
            >
              <Text style={styles.loginButtonText}>Ir a Registro</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    borderRadius: 50,
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    marginTop: -40,
  },
  logo: {
    width: 240,
    height: 180,
    resizeMode: 'contain',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#BD632F',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 30,
    width: '80%',
    position: 'relative',
  },
  activeTabBackground: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#000',
  },
  forgotPassword: {
    fontSize: 13,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  exploreContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  exploreText: {
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
