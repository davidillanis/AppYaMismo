import ActualOrderCard from '@/components/widgets/ActualOrderCard';
import SummaryCard from '@/components/widgets/SummaryCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { useAuth } from '@/src/presentation/context/AuthContext';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const HomePage: React.FC = () => {
    const authority = "Repartidor";
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];
    const { width } = useWindowDimensions();
    const normalize = (size: number) => normalizeScreen(size, width);

    const styles = createStyles(colors, normalize);
    return (
        <View>

            <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>¡Hola, {user?.name}! 👋</Text>
            </View>

            <ActualOrderCard
                colors={colors}
                screenWidth={width}
            />
            {/* Resumen */}
            <SummaryCard
                colors={colors}
                screenWidth={width}
            />
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
        subtitle: {
            fontSize: normalize(16),
            color: colors.textSecondary,
            fontFamily: colors.fontSecondary
        },

    });

export default HomePage; 