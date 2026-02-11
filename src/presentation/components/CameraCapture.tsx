// src/presentation/components/camera/CameraCapture.tsx
import { Colors } from '@/constants/Colors';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraCaptureProps {
    onPhotoTaken: (base64: string) => void;
    onCancel: () => void;
    quality?: number; // 0-1, default 0.7
    maxWidth?: number; // px, para resize automático
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
    onPhotoTaken,
    onCancel,
    quality = 0.7,
}) => {
    const colorScheme = 'dark'; // Force dark mode for camera UI
    const colors = Colors[colorScheme];
    const { width: screenWidth } = useWindowDimensions();
    const normalize = (size: number) => normalizeScreen(size, screenWidth);

    const [permission, requestPermission] = useCameraPermissions();
    const [isCapturing, setIsCapturing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const cameraRef = useRef<CameraView>(null);

    const toggleFlash = () => {
        setFlash(prev => (prev === 'off' ? 'on' : 'off'));
    };

    if (!permission) {
        return (
            <View style={[styles(colors, normalize).container, styles(colors, normalize).centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles(colors, normalize).permissionContainer}>
                <View style={styles(colors, normalize).permissionContent}>
                    <View style={styles(colors, normalize).iconCircle}>
                        <Ionicons name="camera" size={normalize(48)} color={colors.text} />
                    </View>
                    <Text style={styles(colors, normalize).permissionTitle}>
                        Permiso de Cámara
                    </Text>
                    <Text style={styles(colors, normalize).permissionText}>
                        Necesitamos acceso a la cámara para que puedas registrar las entregas correctamente.
                    </Text>
                    <TouchableOpacity
                        style={styles(colors, normalize).permissionButton}
                        onPress={requestPermission}
                        activeOpacity={0.8}
                    >
                        <Text style={styles(colors, normalize).permissionButtonText}>
                            Dar permiso
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles(colors, normalize).cancelButtonAlt}
                        onPress={onCancel}
                    >
                        <Text style={styles(colors, normalize).cancelButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleTakePhoto = async () => {
        if (!cameraRef.current || isCapturing || isProcessing) return;

        try {
            setIsCapturing(true);

            const photo = await cameraRef.current.takePictureAsync({
                quality,
                skipProcessing: false,
            });

            if (!photo?.uri) {
                throw new Error('No se pudo capturar la foto');
            }

            setIsCapturing(false);
            setIsProcessing(true);

            const base64 = await convertToBase64(photo.uri);

            // Clean up
            await FileSystem.deleteAsync(photo.uri, { idempotent: true }).catch(() => { });

            onPhotoTaken(base64);

        } catch (error) {
            console.error('Camera capture error:', error);
            Alert.alert(
                'Error',
                'No se pudo procesar la imagen. Intenta nuevamente.',
                [{ text: 'OK' }]
            );
            setIsCapturing(false);
            setIsProcessing(false);
        }
    };

    const convertToBase64 = async (uri: string): Promise<string> => {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: "base64",
            });
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            console.error('Base64 conversion error:', error);
            throw new Error('Error al procesar la imagen');
        }
    };

    return (
        <View style={styles(colors, normalize).container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={flash === 'on'}
            />

            {/* UI Overlay */}
            <SafeAreaView style={styles(colors, normalize).overlay} pointerEvents="box-none">

                {/* Header: Close & Flash */}
                <View style={styles(colors, normalize).header}>
                    <TouchableOpacity
                        style={styles(colors, normalize).headerButton}
                        onPress={onCancel}
                        disabled={isProcessing}
                    >
                        <Ionicons name="close" size={normalize(28)} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles(colors, normalize).headerButton}
                        onPress={toggleFlash}
                        disabled={isProcessing}
                    >
                        <Ionicons
                            name={flash === 'on' ? "flash" : "flash-off"}
                            size={normalize(24)}
                            color={flash === 'on' ? "#FFD700" : "white"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Center: Guides */}
                <View style={styles(colors, normalize).guidesContainerWrapper}>
                    <View style={styles(colors, normalize).guideCorners}>
                        <View style={[styles(colors, normalize).corner, styles(colors, normalize).cornerTL]} />
                        <View style={[styles(colors, normalize).corner, styles(colors, normalize).cornerTR]} />
                        <View style={[styles(colors, normalize).corner, styles(colors, normalize).cornerBL]} />
                        <View style={[styles(colors, normalize).corner, styles(colors, normalize).cornerBR]} />
                    </View>
                    <Text style={styles(colors, normalize).instructionText}>
                        Centra el objeto
                    </Text>
                </View>

                {/* Footer: Capture */}
                <View style={styles(colors, normalize).footer}>
                    <TouchableOpacity
                        style={[
                            styles(colors, normalize).captureButtonOuter,
                            (isCapturing || isProcessing) && styles(colors, normalize).captureButtonDisabled
                        ]}
                        onPress={handleTakePhoto}
                        disabled={isCapturing || isProcessing}
                        activeOpacity={0.7}
                    >
                        <View style={styles(colors, normalize).captureButtonInner} />
                    </TouchableOpacity>
                </View>

            </SafeAreaView>

            {/* Processing Overlay (Full Screen Block) */}
            {isProcessing && (
                <View style={styles(colors, normalize).processingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles(colors, normalize).processingText}>Guardando...</Text>
                </View>
            )}
        </View>
    );
};

const styles = (colors: any, normalize: (size: number) => number) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'black',
        },
        permissionContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        permissionContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: normalize(32),
        },
        iconCircle: {
            width: normalize(80),
            height: normalize(80),
            borderRadius: normalize(40),
            backgroundColor: colors.surfaceVariant || '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: normalize(24),
        },
        permissionTitle: {
            fontSize: normalize(24),
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: normalize(12),
            textAlign: 'center',
        },
        permissionText: {
            fontSize: normalize(16),
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: normalize(32),
            lineHeight: normalize(24),
        },
        permissionButton: {
            backgroundColor: colors.primary,
            paddingVertical: normalize(16),
            paddingHorizontal: normalize(32),
            borderRadius: normalize(30),
            width: '100%',
            alignItems: 'center',
            marginBottom: normalize(16),
        },
        permissionButtonText: {
            color: '#fff',
            fontSize: normalize(16),
            fontWeight: '600',
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        overlay: {
            flex: 1,
            justifyContent: 'space-between',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: normalize(20),
            paddingTop: normalize(10),
        },
        headerButton: {
            width: normalize(44),
            height: normalize(44),
            borderRadius: normalize(22),
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        guidesContainerWrapper: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
        },
        guideCorners: {
            width: normalize(260),
            height: normalize(260),
            position: 'relative',
        },
        corner: {
            position: 'absolute',
            width: normalize(20),
            height: normalize(20),
            borderColor: 'white',
            borderWidth: 3,
            opacity: 0.8,
        },
        cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
        cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
        cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
        cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
        instructionText: {
            color: 'white',
            marginTop: normalize(20),
            fontSize: normalize(16),
            fontWeight: '600',
            textShadowColor: 'rgba(0,0,0,0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
            backgroundColor: 'rgba(0,0,0,0.3)',
            paddingHorizontal: normalize(12),
            paddingVertical: normalize(4),
            borderRadius: normalize(8),
            overflow: 'hidden',
        },
        footer: {
            paddingBottom: normalize(30),
            alignItems: 'center',
            justifyContent: 'center',
        },
        captureButtonOuter: {
            width: normalize(84),
            height: normalize(84),
            borderRadius: normalize(42),
            borderWidth: 4,
            borderColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
        },
        captureButtonInner: {
            width: normalize(68),
            height: normalize(68),
            borderRadius: normalize(34),
            backgroundColor: 'white',
        },
        captureButtonDisabled: {
            opacity: 0.5,
        },
        cancelButtonAlt: {
            padding: normalize(12),
        },
        cancelButtonText: {
            color: colors.textSecondary,
            fontSize: normalize(16),
        },
        processingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        },
        processingText: {
            color: 'white',
            marginTop: normalize(16),
            fontSize: normalize(16),
            fontWeight: '500',
        },
    });