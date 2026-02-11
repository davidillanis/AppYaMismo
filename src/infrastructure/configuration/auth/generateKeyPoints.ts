import { LatLng } from 'react-native-maps';

export const getDistance = (start: LatLng, end: LatLng): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (start.latitude * Math.PI) / 180;
  const φ2 = (end.latitude * Math.PI) / 180;
  const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
  const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const generateKeyPoints = (polyline: LatLng[], interval = 200): LatLng[] => {
  if (polyline.length < 2) return polyline;

  const keyPoints: LatLng[] = [polyline[0]];
  let accumulated = 0;

  for (let i = 1; i < polyline.length; i++) {
    const start = polyline[i - 1];
    const end = polyline[i];
    const segmentDistance = getDistance(start, end);
    accumulated += segmentDistance;

    if (accumulated >= interval) {
      keyPoints.push(end);
      accumulated = 0;
    }
  }

  const lastPoint = polyline[polyline.length - 1];
  const lastKeyPoint = keyPoints[keyPoints.length - 1];
  if (getDistance(lastKeyPoint, lastPoint) > 10) {
    keyPoints.push(lastPoint);
  }

  return keyPoints;
};
