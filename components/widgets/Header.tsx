import { Colors } from '@/constants/Colors';
import { HeaderProps } from '@/src/domain/types/WidgetsType';
import { APK_CITY, APK_COMPANY_NAME, APK_NAME, normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const Header: React.FC<HeaderProps> = ({
  colors,
  screenWidth,
  onMenuPress,
  onProfilePress,
  title = APK_NAME,
  subTitle = `${APK_COMPANY_NAME} ${APK_CITY}`,
  iconProfile: iconName,
}) => {
  //const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * (screenWidth / 375)));
  const normalize = (size: number) => normalizeScreen(size, screenWidth);
  const styles = createStyles(colors, normalize, screenWidth);

  return (
    <LinearGradient colors={[colors.primary, colors.primary]} style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu" size={normalize(24)} color="#eefaf1ff" />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subTitle}</Text>
      </View>

      <TouchableOpacity
        onPress={onProfilePress}
        style={styles.profileIcon}
        activeOpacity={0.8}
        disabled={!onProfilePress}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
          style={styles.profileGradient}
        >
          {
            iconName ? (
              <Ionicons name={iconName} size={normalize(24)} color={colors.card} />
            ) : (
              <Image
                source={require('@/assets/images/user.png')}
                style={styles.logoImage}
              />
            )
          }
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number, screenWidth: number) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: screenWidth >= 768 ? 32 : 15,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8
    },
    menuButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.15)'
    },
    headerTitleContainer: {
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: normalize(22),
      fontWeight: 'bold',
      fontFamily: colors.fontTertiary,
      color: "#eefaf1ff",
    },
    headerSubtitle: {
      fontSize: normalize(12),
      color: 'rgba(255,255,255,0.8)',
      fontFamily: colors.fontSecondary
    },
    profileIcon: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: normalize(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden'
    },
    profileGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 18
    },
    logoImage: {
      width: normalize(32),
      height: normalize(32),
      resizeMode: 'contain'
    },
  });

export default Header;