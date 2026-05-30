import { RiderCurrentLocation, RiderOwnershipRecord } from '../entities/rider-ownership.entity';
type RiderLocationPayload = {
    deliveryId: string | null;
    latitude: number;
    longitude: number;
    heading: number | null;
    speed: number | null;
    accuracyMeters: number | null;
    recordedAt: Date;
};
export declare function canIngestRiderLocation(rider: RiderOwnershipRecord, hasActiveDelivery: boolean): boolean;
export declare function isDuplicateRiderLocation(currentLocation: RiderCurrentLocation | null, payload: RiderLocationPayload): currentLocation is RiderCurrentLocation;
export {};
