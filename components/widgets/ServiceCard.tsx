import { Colors } from '@/constants/Colors';
import { ServiceCardProps } from '@/src/domain/types/WidgetsType';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ServiceCard: React.FC<ServiceCardProps> = ({
  colors,
  screenWidth,
  serviceCards,
  onNavigate,
}) => {
  //const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * (screenWidth / 375)));
  const normalize = (size: number) => normalizeScreen(size, screenWidth);

  const getCardWidth = () => (screenWidth >= 1200 ? '20%' : screenWidth >= 1024 ? '22%' : screenWidth >= 768 ? '30%' : '48%');
  const styles = createStyles(colors, normalize, getCardWidth);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Servicios disponibles</Text>
      <View style={styles.optionsGrid}>
        {serviceCards.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionCard, { width: getCardWidth() }]}
            onPress={() => onNavigate(service.route)}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: `${service.color}15` }]}>
              <Ionicons name={service.icon as any} size={normalize(24)} color={service.color} />
            </View>
            <Text style={styles.optionTitle}>{service.title}</Text>
            <Text style={styles.optionDescription}>{service.description}</Text>
            <View style={styles.optionFooter}>
              <Ionicons name="arrow-forward" size={normalize(14)} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number, getCardWidth: () => string) =>
  StyleSheet.create({
    section: { 
      paddingHorizontal: 20, 
      marginBottom: 24 
    },
    sectionTitle: { 
      fontSize: normalize(20), 
      fontWeight: 'bold', 
      color: colors.text, 
      marginBottom: 16, 
      fontFamily: colors.fontPrimary 
    },
    optionsGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between' 
    },
    optionCard: { 
      backgroundColor: colors.card, 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 16, 
      minHeight: 140, 
      elevation: 4, 
      shadowColor: colors.primary, 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 4 
    },
    optionIconContainer: { 
      width: normalize(48), 
      height: normalize(48), 
      borderRadius: normalize(24), 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginBottom: 12 
    },
    optionTitle: { 
      fontSize: normalize(16), 
      fontWeight: 'bold', 
      color: colors.text, 
      fontFamily: colors.fontPrimary 
    },
    optionDescription: { 
      fontSize: normalize(12), 
      color: colors.textSecondary, 
      lineHeight: normalize(18), 
      fontFamily: colors.fontSecondary 
    },
    optionFooter: { 
      alignSelf: 'flex-end', 
      marginTop: 8 
    },
  });

export default ServiceCard;