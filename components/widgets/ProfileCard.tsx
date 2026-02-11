import { Colors } from '@/constants/Colors';
import { ProfileCardProps } from '@/src/domain/types/WidgetsType';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const ProfileCard: React.FC<ProfileCardProps> = ({
  colors,
  user,
  authority,
  screenWidth,
  onEditPress,
}) => {
  //const normalize = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * (screenWidth / 375)));
  const normalize = (size: number) => normalizeScreen(size, screenWidth);
  
  const styles = createStyles(colors, normalize);
  //const roles:string[]=rolesByToken(user?.accessToken+"").map(role=>role.toLowerCase().replace(/^./, c => c.toUpperCase()));

  return (
    <View style={styles.profileSection}>
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={normalize(24)} color={colors.primary} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileCardName}>{user?.name}</Text>
            <Text style={styles.profileCardEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{authority}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Ionicons name="create-outline" size={normalize(18)} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
  StyleSheet.create({
    profileSection: { 
      paddingHorizontal: 20, 
      marginBottom: 24 
    },
    profileCard: { 
      backgroundColor: colors.card, 
      borderRadius: 16, 
      padding: 20, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      borderWidth: 1, 
      borderColor: colors.border, 
      elevation: 4, 
      shadowColor: colors.primary, 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 4 
    },
    profileInfo: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      flex: 1 
    },
    profileAvatar: { 
      width: normalize(48), 
      height: normalize(48), 
      borderRadius: normalize(24), 
      backgroundColor: colors.surfaceVariant, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginRight: 16 
    },
    profileDetails: { 
      flex: 1 
    },
    profileCardName: { 
      fontSize: normalize(18), 
      fontWeight: 'bold', 
      color: colors.text, 
      fontFamily: colors.fontPrimary 
    },
    profileCardEmail: { 
      fontSize: normalize(14), 
      color: colors.textSecondary, 
      fontFamily: colors.fontSecondary 
    },
    roleBadge: { 
      backgroundColor: colors.primary, 
      paddingHorizontal: 8, 
      paddingVertical: 2, 
      borderRadius: 8, 
      alignSelf: 'flex-start',
      marginTop:1
    },
    roleBadgeText: { 
      fontSize: normalize(10), 
      color: colors.textInverse, 
      fontFamily: colors.fontTertiary 
    },
    editButton: { 
      width: normalize(36), 
      height: normalize(36), 
      borderRadius: normalize(18), 
      backgroundColor: colors.surfaceVariant, 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: colors.border 
    },
  });

export default ProfileCard;