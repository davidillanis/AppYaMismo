import { Colors } from "@/constants/Colors";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";

interface HeaderItemProps {
  title?: string; 
  subtitle?: string;
}

const HeaderItem: React.FC<HeaderItemProps> = ({ title, subtitle="" }) => {
  const { width: screenWidth } = useWindowDimensions();
  const normalize = (size: number) => normalizeScreen(size, screenWidth);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const styles = createStyles(colors, normalize);
  const router = useRouter();

  const [showItemList, setShowItemList] = useState(true);
  const [selectedItem, setSelectedItem] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
      const [showAddModal, setShowAddModal] = useState(false);
  

  const handleBackPress = useCallback(() => {
    if (!showItemList) {
      setSelectedItem(null);
      setShowItemList(true);
    } else {
      router.back();
    }
  }, [showItemList, router]);

  const handleRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
  }, []);

  return (
    <>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons
            name="arrow-back"
            size={normalize(24)}
            color={colors.textInverse}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showItemList ? title : subtitle}
        </Text>
        {showItemList && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
              disabled={loading}
            >
              <Ionicons
                name="refresh"
                size={normalize(20)}
                color={colors.textInverse}
                style={loading ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons
                name="add"
                size={normalize(24)}
                color={colors.textInverse}
              />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </>
  );
};

export default HeaderItem;
