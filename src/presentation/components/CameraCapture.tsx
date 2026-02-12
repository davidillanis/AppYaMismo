// src/presentation/components/camera/CameraCapture.tsx
import { Colors } from '@/constants/Colors';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraCaptureProps {
    onPhotoTaken: (base64: string) => void;
    onCancel: () => void;
    quality?: number; // 0-1, default 0.7
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
    const [facing, setFacing] = useState<CameraType>('back');
    const cameraRef = useRef<CameraView>(null);

    // Shutter flash animation value
    const flashOpacity = useRef(new Animated.Value(0)).current;

    const toggleFlash = () => {
        setFlash(prev => (prev === 'off' ? 'on' : 'off'));
    };

    const toggleCamera = () => {
        setFacing(prev => (prev === 'back' ? 'front' : 'back'));
    };

    const triggerShutterEffect = () => {
        Animated.sequence([
            Animated.timing(flashOpacity, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    if (!permission) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
                <View style={styles.permissionContent}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
                        <Ionicons name="camera" size={normalize(48)} color={colors.text} />
                    </View>
                    <Text style={[styles.permissionTitle, { color: colors.text }]}>
                        Acceso a Cámara
                    </Text>
                    <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
                        Para tomar tu foto, necesitamos acceso a la cámara de tu dispositivo.
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionButton, { backgroundColor: colors.primary }]}
                        onPress={requestPermission}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.permissionButtonText}>
                            Permitir Acceso
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButtonAlt}
                        onPress={onCancel}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleTakePhoto = async () => {
        if (!cameraRef.current || isCapturing || isProcessing) return;

        try {
            setIsCapturing(true);
            triggerShutterEffect(); // Visual feedback immediately

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
            Alert.alert('Error', 'No se pudo procesar la imagen.', [{ text: 'OK' }]);
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={flash === 'on'}
            />

            {/* Shutter Animation Overlay */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'black', opacity: flashOpacity } // Use black or white depending on preference. White mimics flash better.
                ]}
                pointerEvents="none"
            />

            <SafeAreaView style={styles.uiContainer} pointerEvents="box-none">

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.iconButtonBlur}
                        onPress={onCancel}
                        disabled={isProcessing}
                    >
                        <Ionicons name="close" size={normalize(26)} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButtonBlur}
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

                {/* Bottom Bar Controls */}
                <View style={styles.bottomBar}>

                    {/* Spacer / Left Action Placeholder */}
                    <View style={styles.bottomSideAction}>
                        {/* Future: Gallery Button could go here */}
                    </View>

                    {/* Shutter Button */}
                    <View style={styles.shutterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.shutterOuter,
                                (isCapturing || isProcessing) && styles.shutterDisabled
                            ]}
                            onPress={handleTakePhoto}
                            disabled={isCapturing || isProcessing}
                            activeOpacity={0.7}
                        >
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>
                    </View>

                    {/* Flip Camera */}
                    <View style={styles.bottomSideAction}>
                        <TouchableOpacity
                            style={styles.iconButtonBlur}
                            onPress={toggleCamera}
                            disabled={isProcessing}
                        >
                            <Ionicons
                                name="camera-reverse"
                                size={normalize(28)}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>

            {/* Processing Overlay */}
            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.processingText}>Procesando...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const normalize = (size: number, width: number) => {
    const scale = width / 375;
    return Math.round(size * scale);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    uiContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingBottom: 20,
    },
    bottomSideAction: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)', // Glassmorphism-ish look
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    shutterDisabled: {
        opacity: 0.5,
    },

    // Permission Styles
    permissionContainer: {
        flex: 1,
    },
    permissionContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    permissionButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonAlt: {
        padding: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },

    // Processing Styles
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    processingContainer: {
        padding: 20,
        backgroundColor: 'rgba(30,30,30,0.9)',
        borderRadius: 16,
        alignItems: 'center',
    },
    processingText: {
        color: 'white',
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
});