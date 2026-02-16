import { Colors } from "@/constants/Colors";
import { DrawerMenuProps } from "@/src/domain/types/WidgetsType";
import { getRoleRoutes } from "@/src/infrastructure/configuration/security/DecodeToken";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const DrawerMenu: React.FC<DrawerMenuProps> = ({
  colors,
  user,
  screenWidth,
  authority,
  menuItems,
  onNavigate,
  onLogout,
}) => {
  //const normalize = (size: number) =>Math.round(PixelRatio.roundToNearestPixel(size * (screenWidth / 375)));
  const normalize = (size: number) => normalizeScreen(size, screenWidth);
  const styles = createStyles(colors, normalize);
  const rolesRoute = getRoleRoutes(user?.accessToken);
  const router = useRouter();

  return (
    <View style={styles.drawerContainer}>
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.drawerHeader}
      >
        <View style={styles.profileImageContainer}>
          <Ionicons
            name="person"
            size={normalize(32)}
            color={colors.textInverse}
          />
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>{authority}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.menuContainer, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => onNavigate(item.route)}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.card }]}>
              <Ionicons
                name={item.icon as any}
                size={normalize(20)}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons
              name="chevron-forward"
              size={normalize(16)}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}

        {rolesRoute.length > 1 && (
          <>
            <Text style={[styles.permissionsText, { backgroundColor: colors.surface }, { color: colors.text }]}> Permisos </Text>
            {rolesRoute.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, styles.roleMenuItem]}
                onPress={() => router.replace(item.route)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name="shield-checkmark" // icono único para todos los roles
                    size={normalize(20)}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.menuText}>
                  {item.role
                    .toString()
                    .toLowerCase()
                    .replace(/^./, (c) => c.toUpperCase())}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={normalize(16)}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.drawerFooter, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.warning }]}
          onPress={async () => {
            await onLogout();
            router.replace("/(auth)/login");
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={normalize(18)}
            color={colors.textInverse}
          />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (
  colors: typeof Colors.light,
  normalize: (n: number) => number
) =>
  StyleSheet.create({
    drawerContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    drawerHeader: {
      padding: 24,
      paddingTop: 50,
      alignItems: "center",
    },
    profileImageContainer: {
      width: normalize(64),
      height: normalize(64),
      borderRadius: normalize(32),
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    profileName: {
      fontSize: normalize(20),
      fontWeight: "bold",
      color: colors.textInverse,
      fontFamily: colors.fontPrimary,
    },
    profileEmail: {
      fontSize: normalize(14),
      color: "rgba(255,255,255,0.9)",
      fontFamily: colors.fontSecondary,
    },
    profileBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    profileBadgeText: {
      fontSize: normalize(12),
      color: colors.textInverse,
      fontWeight: "600",
      fontFamily: colors.fontTertiary,
    },
    menuContainer: {
      flex: 1,
      paddingTop: 8,
      maxHeight: "55%",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIconContainer: {
      width: normalize(32),
      height: normalize(32),
      borderRadius: normalize(16),
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    menuText: {
      fontSize: normalize(16),
      color: colors.text,
      flex: 1,
      fontFamily: colors.fontPrimary,
    },
    drawerFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
      paddingVertical: 14,
      borderRadius: 12,
    },

    logoutText: {
      fontSize: normalize(16),
      color: colors.textInverse,
      fontWeight: "600",
      marginLeft: 8,
      fontFamily: colors.fontPrimary,
    },

    roleMenuItem: {
      backgroundColor: colors.successLight,
      borderLeftWidth: 4,
      borderLeftColor: colors.secondary,
    },

    roleBadge: {
      backgroundColor: "rgba(71, 16, 16, 0.1)",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 8,
    },

    roleBadgeContainer: {
      backgroundColor: colors.primary,
    },

    roleBadgeText: {
      fontSize: normalize(10),
      color: colors.textInverse,
      fontWeight: "600",
      fontFamily: colors.fontTertiary,
    },

    permissionsText: {
      fontSize: normalize(16),
      fontWeight: "700",
      color: colors.text,
      fontFamily: colors.fontPrimary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginTop: 12,
      marginBottom: 8,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
  });

export default DrawerMenu;
