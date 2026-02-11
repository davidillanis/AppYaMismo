import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GenerateQR: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'normal'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const normalize = (size: number) => normalizeScreen(size, 390);

  const styles = createStyles(normalize);

  // Puedes cambiar este enlace QR a lo que desees
  const qrImage =
    'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://tuapp.com/pedido/12345';

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.primary} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Generar QR</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="qr-code-outline" size={22} color={colors.text} />
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Escanea este código QR
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Muestra este código al repartidor para confirmar tu pedido
          </Text>

          <Image source={{ uri: qrImage }} style={styles.qrImage} />

          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/GenerateQR')} 
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.refreshText}>Generar nuevo QR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

// Estilos
const createStyles = (normalize: (n: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E7D6B9',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: '#D9C4A1',
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: normalize(17),
      color: '#000',
    },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: normalize(18),
      fontWeight: 'bold',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: normalize(13),
      textAlign: 'center',
      marginBottom: 25,
    },
    qrImage: {
      width: 220,
      height: 220,
      borderRadius: 10,
      marginBottom: 30,
      borderWidth: 2,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 25,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
    },
    refreshText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: 8,
    },
  });

export default GenerateQR;
