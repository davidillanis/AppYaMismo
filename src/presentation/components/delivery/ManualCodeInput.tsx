import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ManualCodeInputProps {
    colors: typeof Colors.light;
    onCodeSubmit: (code: string) => void;
    onCancel?: () => void;
}

export const ManualCodeInput: React.FC<ManualCodeInputProps> = ({
    colors,
    onCodeSubmit,
    onCancel
}) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (text: string) => {
        // Solo permitir números
        const numericText = text.replace(/[^0-9]/g, '');
        setCode(numericText);
        setError('');
    };

    const handleSubmit = () => {
        if (code.length !== 6) {
            setError('El código debe tener exactamente 6 dígitos');
            return;
        }
        onCodeSubmit(code);
    };

    const isValid = code.length === 6;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
                <Ionicons name="keypad" size={32} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>
                    Código Manual
                </Text>
            </View>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Ingresa el código de 6 dígitos proporcionado por el cliente
            </Text>

            <View style={[
                styles.inputContainer,
                {
                    borderColor: error ? colors.error : (isValid ? colors.success : colors.border),
                    backgroundColor: colors.background
                }
            ]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={code}
                    onChangeText={handleInputChange}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus={true}
                    textAlign="center"
                />
            </View>

            {/* Visual Feedback */}
            <View style={styles.dotsContainer}>
                {[...Array(6)].map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: index < code.length
                                    ? colors.primary
                                    : colors.border
                            }
                        ]}
                    />
                ))}
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    {
                        backgroundColor: isValid ? colors.primary : colors.border,
                        opacity: isValid ? 1 : 0.5
                    }
                ]}
                onPress={handleSubmit}
                disabled={!isValid}
            >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Confirmar Entrega</Text>
            </TouchableOpacity>

            {onCancel && (
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                        Cancelar
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        width: '100%',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 64,
        justifyContent: 'center',
    },
    input: {
        fontSize: 32,
        letterSpacing: 12,
        fontWeight: 'bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
    },
    submitButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 12,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
