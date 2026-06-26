export declare class RiderLocationDto {
    riderId: string;
    deliveryId: string | null;
    latitude: string;
    longitude: string;
    heading: string | null;
    speed: string | null;
    accuracyMeters: string | null;
    recordedAt: string;
    duplicate: boolean;
}
