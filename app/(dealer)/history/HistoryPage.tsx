import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const HistoryPage: React.FC = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];
    const { width } = useWindowDimensions();
    const normalize = (size: number) => normalizeScreen(size, width);

    const styles = createStyles(colors, normalize);
    return (
        <View>
            {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={styles.greetingContainer}>
                    <Text style={styles.greeting}>¡HISTORIAL!</Text>
                </View>
            ))}
        </View>
    );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
    StyleSheet.create({
        greetingContainer: {
            padding: 20
        },
        greeting: {
            fontSize: normalize(28),
            fontWeight: 'bold',
            color: colors.text,
            fontFamily: colors.fontPrimary
        },
    });

export default HistoryPage; 