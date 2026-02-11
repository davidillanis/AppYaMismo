// src/domain/types/MapType.ts
export interface CustomerMapPoint {
    latitude: number;
    longitude: number;
    name: string;
    phone?: string;
    address?: string;
}

export interface ProductMapPoint {
    name: string;
    price: number;
    quantity: number;
}

export interface RestaurantMapPoint {
    latitude: number;
    longitude: number;
    name: string;
    address?: string;
    products: ProductMapPoint[];
}

export interface OrderMapPoint {
    id: number;
    customer: CustomerMapPoint;
    restaurant: RestaurantMapPoint[];
}

// Validadores
export const isValidCoordinate = (lat?: number, lng?: number): boolean => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

export const FALLBACK_COORDS = {
    latitude: -13.6556,
    longitude: -73.3872,
} as const;