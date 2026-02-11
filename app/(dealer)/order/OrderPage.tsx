import { Colors } from "@/constants/Colors";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, useWindowDimensions, View } from "react-native";
import CompleteTab from "./CompleteTab";
import PendingTab from "./PendingTab";

const OrderPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"pendientes" | "completados">("pendientes");
    const { width } = useWindowDimensions();
    const normalize = useCallback((size: number) => normalizeScreen(size, width), [width]);
    const colorScheme = useColorScheme() ?? "normal";
    const colors = Colors[colorScheme ?? "normal"];
    const customStyles = createCustomStyles(colors, normalize);

    const handleTabChange = useCallback((tab: "pendientes" | "completados") => {
        setActiveTab(tab);
    }, []);
    return (
        <View style={{ flex: 1 }}>
            <View style={{ marginTop: normalize(10), padding: normalize(10) }}>
                <View style={customStyles.tabContainer}>
                    <TouchableOpacity style={[customStyles.tabButton, activeTab === "pendientes" && customStyles.activeTab,]} onPress={() => handleTabChange("pendientes")} activeOpacity={0.7}>
                        <Ionicons name="bicycle-outline" size={normalize(18)} color={activeTab === "pendientes" ? "#fff" : "#333"} />
                        <Text style={[customStyles.tabText, activeTab === "pendientes" && customStyles.activeTabText,]}>
                            Pendientes
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[customStyles.tabButton, activeTab === "completados" && customStyles.activeTab,]} onPress={() => handleTabChange("completados")} activeOpacity={0.7}>
                        <Ionicons name="checkmark-done-outline" size={normalize(18)} color={activeTab === "completados" ? "#fff" : "#333"} />
                        <Text style={[customStyles.tabText, activeTab === "completados" && customStyles.activeTabText,]}>
                            Completados
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* Subtítulo */}
                <View style={customStyles.subTitleContainer}>
                    <Text style={[customStyles.subTitle, { color: colors.text }]}>
                        {activeTab === "pendientes" ? "Cola de entregas" : "Historial"}
                    </Text>
                </View>
            </View>

            {/* Tab Content - Cada tab tiene su propio FlatList */}
            <View style={{ flex: 1 }}>
                {activeTab === "pendientes" ? <PendingTab /> : <CompleteTab />}
            </View>
        </View>
    );
};
const createCustomStyles = (colors: any, normalize: (n: number) => number) =>
    StyleSheet.create({
        headerContainer: {
            paddingHorizontal: normalize(10),
            paddingTop: normalize(10),
            backgroundColor: colors.background,
        },
        tabContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 15,
            gap: 10,
        },
        tabButton: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
            backgroundColor: "#d8c8a8",
            gap: 8,
        },
        activeTab: {
            backgroundColor: "#A4243B",
            shadowColor: "#A4243B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        tabText: {
            color: "#333",
            fontWeight: "600",
            fontSize: normalize(14),
        },
        activeTabText: {
            color: "#fff",
        },
        subTitleContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 15,
        },
        subTitle: {
            fontWeight: "bold",
            fontSize: normalize(16),
        },
    });

export default OrderPage;