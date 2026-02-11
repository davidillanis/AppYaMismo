import { PixelRatio, Platform } from "react-native";

export const APK_NAME = "YaMismo";
export const APK_CITY = "Andahuaylas";
export const APK_COMPANY_NAME = "";

export const normalizeScreen = (size: number, width: number) => {
  if (Platform.OS === "web") return size;
  return Math.round(PixelRatio.roundToNearestPixel(size * (width / 375)));
};
