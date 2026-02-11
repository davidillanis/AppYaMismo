// src/presentation/components/pages/CameraPage.tsx
import { Colors } from "@/constants/Colors";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { CameraCapture } from "@/src/presentation/components/CameraCapture";
import { useUpdateProduct } from "@/src/presentation/hooks/useProductMutation";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const CameraPage: React.FC = () => {
    const { width: screenWidth } = useWindowDimensions();
    const normalize = useCallback((size: number) => normalizeScreen(size, screenWidth), [screenWidth]);
    const colorScheme = useColorScheme() ?? "normal";
    const colors = Colors[colorScheme];
    const styles = createStyles(colors, normalize);

    // CAMERA STATE
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const updateProduct = useUpdateProduct();

    const handlePhotoTaken = async (base64: string) => {
        try {
            setShowCamera(false);
            setCapturedImage(base64);
            setIsUploading(true);

            const response = await uploadImageToImgBB(base64, 600, async (url) => {
                const rest = await updateProduct.mutateAsync({ id: 1, payload: { urlImage: url } })
                console.log(rest.data)
            });
            const imageUrl = response.data.display_url;

            setUploadedUrl(imageUrl);
            console.log('Image uploaded:', imageUrl);

            Toast.show({
                type: 'success',
                text1: 'Foto guardada correctamente',
                topOffset: normalize(60),
            });
        } catch (error) {
            console.log(mappingError(error))
            Toast.show({
                type: 'error',
                text1: 'Error al guardar la foto',
                text2: 'Intenta nuevamente',
                topOffset: normalize(60),
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetakePhoto = () => {
        setCapturedImage(null);
        setUploadedUrl(null);
        setShowCamera(true);
    };

    const handleDeletePhoto = () => {
        setCapturedImage(null);
        setUploadedUrl(null);
    };

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibraryAsync({
                mediaTypes: MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                    const base64 = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
                    handlePhotoTaken(base64);
                }
            }
        } catch (error) {
            console.log("Error picking image", error);
            Toast.show({
                type: 'error',
                text1: 'Error al seleccionar imagen',
                topOffset: normalize(60),
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                    accessibilityLabel="Volver atrás"
                >
                    <Ionicons name="arrow-back" size={normalize(24)} color={colors.textInverse} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Captura de Foto</Text>
                <View style={styles.headerRight} />
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* CAMERA */}
                {!capturedImage && (
                    <View style={styles.instructionsCard}>
                        <Ionicons
                            name="information-circle-outline"
                            size={normalize(32)}
                            color={colors.primary}
                        />
                        <Text style={styles.instructionsTitle}>
                            Captura una foto
                        </Text>
                        <Text style={styles.instructionsText}>
                            Presiona el botón para abrir la cámara y capturar una imagen
                        </Text>
                    </View>
                )}

                {/* Photo Preview */}
                {capturedImage && (
                    <View style={styles.photoCard}>
                        <Text style={styles.sectionTitle}>Vista previa</Text>
                        <Image
                            source={{ uri: capturedImage }}
                            style={styles.photoPreview}
                            resizeMode="cover"
                        />

                        {/* Upload Status */}
                        {isUploading && (
                            <View style={styles.uploadingBadge}>
                                <ActivityIndicator size="small" color={colors.textInverse} />
                                <Text style={styles.uploadingText}>Subiendo...</Text>
                            </View>
                        )}

                        {uploadedUrl && (
                            <View style={styles.successBadge}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={normalize(20)}
                                    color={colors.textInverse}
                                />
                                <Text style={styles.successText}>Subida exitosa</Text>
                            </View>
                        )}

                        {/* Photo Actions */}
                        <View style={styles.photoActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleRetakePhoto}
                                disabled={isUploading}
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={normalize(20)}
                                    color={colors.primary}
                                />
                                <Text style={styles.actionButtonText}>Tomar otra</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={handleDeletePhoto}
                                disabled={isUploading}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={normalize(20)}
                                    color={colors.error}
                                />
                                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                                    Eliminar
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Uploaded URL */}
                        {uploadedUrl && (
                            <View style={styles.urlCard}>
                                <Text style={styles.urlLabel}>URL de la imagen:</Text>
                                <Text style={styles.urlText} numberOfLines={1}>
                                    {uploadedUrl}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Capture Button */}
                {!capturedImage && (
                    <View style={{ gap: normalize(16) }}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={() => setShowCamera(true)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="camera"
                                size={normalize(28)}
                                color={colors.textInverse}
                            />
                            <Text style={styles.captureButtonText}>Abrir Cámara</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.captureButton, { backgroundColor: colors.secondary }]}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="images"
                                size={normalize(28)}
                                color={colors.textInverse}
                            />
                            <Text style={styles.captureButtonText}>Cargar de Galería</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Camera Modal */}
            <Modal
                visible={showCamera}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowCamera(false)}
            >
                <CameraCapture
                    onPhotoTaken={handlePhotoTaken}
                    onCancel={() => setShowCamera(false)}
                    quality={0.7}
                />
            </Modal>

            <Toast />
        </SafeAreaView>
    );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background
        },
        header: {
            paddingVertical: normalize(16),
            paddingHorizontal: normalize(20),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            elevation: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: normalize(4),
        },
        headerButton: {
            padding: normalize(10),
            borderRadius: normalize(12),
            backgroundColor: "rgba(250,250,250,0.2)",
        },
        headerTitle: {
            fontSize: normalize(20),
            fontWeight: "700",
            color: colors.textInverse,
            flex: 1,
            textAlign: "center",
            fontFamily: colors.fontPrimary,
        },
        headerRight: {
            width: normalize(40)
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: normalize(16),
            paddingVertical: normalize(20),
        },
        instructionsCard: {
            backgroundColor: colors.card,
            borderRadius: normalize(16),
            padding: normalize(24),
            alignItems: "center",
            marginBottom: normalize(20),
            elevation: 2,
            shadowColor: colors.card,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: normalize(4),
        },
        instructionsTitle: {
            fontSize: normalize(18),
            fontFamily: colors.fontPrimary,
            fontWeight: "600",
            color: colors.text,
            marginTop: normalize(12),
            marginBottom: normalize(8),
        },
        instructionsText: {
            fontSize: normalize(14),
            fontFamily: colors.fontSecondary,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: normalize(20),
        },
        captureButton: {
            backgroundColor: colors.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: normalize(12),
            paddingVertical: normalize(18),
            borderRadius: normalize(12),
            elevation: 3,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: normalize(4),
        },
        captureButtonText: {
            color: colors.textInverse,
            fontSize: normalize(16),
            fontFamily: colors.fontPrimary,
            fontWeight: "600",
        },
        photoCard: {
            backgroundColor: colors.card,
            borderRadius: normalize(16),
            padding: normalize(16),
            marginBottom: normalize(20),
            elevation: 2,
            shadowColor: colors.card,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: normalize(4),
        },
        sectionTitle: {
            fontSize: normalize(16),
            fontFamily: colors.fontPrimary,
            fontWeight: "600",
            color: colors.text,
            marginBottom: normalize(12),
        },
        photoPreview: {
            width: "100%",
            aspectRatio: 3 / 4,
            borderRadius: normalize(12),
            backgroundColor: colors.surface,
        },
        uploadingBadge: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: normalize(8),
            backgroundColor: colors.primary,
            paddingVertical: normalize(10),
            borderRadius: normalize(8),
            marginTop: normalize(12),
        },
        uploadingText: {
            color: colors.textInverse,
            fontSize: normalize(14),
            fontFamily: colors.fontPrimary,
            fontWeight: "500",
        },
        successBadge: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: normalize(8),
            backgroundColor: colors.success || "#28a745",
            paddingVertical: normalize(10),
            borderRadius: normalize(8),
            marginTop: normalize(12),
        },
        successText: {
            color: colors.textInverse,
            fontSize: normalize(14),
            fontFamily: colors.fontPrimary,
            fontWeight: "500",
        },
        photoActions: {
            flexDirection: "row",
            gap: normalize(12),
            marginTop: normalize(16),
        },
        actionButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: normalize(6),
            backgroundColor: colors.surface,
            paddingVertical: normalize(12),
            borderRadius: normalize(10),
            borderWidth: 1,
            borderColor: colors.primary,
        },
        actionButtonText: {
            color: colors.primary,
            fontSize: normalize(14),
            fontFamily: colors.fontPrimary,
            fontWeight: "600",
        },
        deleteButton: {
            borderColor: colors.error,
        },
        deleteButtonText: {
            color: colors.error,
        },
        urlCard: {
            backgroundColor: colors.surface,
            padding: normalize(12),
            borderRadius: normalize(8),
            marginTop: normalize(16),
        },
        urlLabel: {
            fontSize: normalize(12),
            fontFamily: colors.fontPrimary,
            color: colors.textSecondary,
            marginBottom: normalize(4),
        },
        urlText: {
            fontSize: normalize(12),
            fontFamily: colors.fontSecondary,
            color: colors.text,
        },
    });

export default CameraPage;