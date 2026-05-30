import { RiderStatus, UserStatus } from '@prisma/client';
type DispatchEligibleRider = {
    status: RiderStatus;
    user: {
        status: UserStatus;
    };
    availability: {
        isOnline: boolean;
        isAvailable: boolean;
    } | null;
};
export declare function isDispatchEligibleRider(rider: DispatchEligibleRider): boolean;
export {};
