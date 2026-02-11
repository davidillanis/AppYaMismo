import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QRScannerProps {
    onCodeScanned: (data: string) => void;
    onRequestManualInput: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onCodeScanned, onRequestManualInput }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
        if (!scanned) {
            setScanned(true);
            onCodeScanned(data);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.text}>Solicitando permisos de cámara...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="camera-outline" size={64} color={colors.error} />
                <Text style={[styles.text, { color: colors.text, marginTop: 16 }]}>
                    No hay acceso a la cámara
                </Text>
                <TouchableOpacity
                    style={[styles.manualButton, { backgroundColor: colors.primary }]}
                    onPress={onRequestManualInput}
                >
                    <Text style={styles.manualButtonText}>Ingresar código manualmente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                {/* Scanner Frame Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.scannerFrame}>
                        {/* Corner Markers */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {/* Scanning Line Animation */}
                        <View style={styles.scanLine} />
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionContainer}>
                    <Text style={styles.instructionText}>
                        Apunta la cámara al código QR del cliente
                    </Text>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#00FF00',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#00FF00',
        opacity: 0.8,
    },
    instructionContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    instructionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        textAlign: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
    },
    manualButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    manualButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
