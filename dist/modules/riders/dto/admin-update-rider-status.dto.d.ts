import { RiderStatus } from '@prisma/client';
export declare class AdminUpdateRiderStatusDto {
    status: Exclude<RiderStatus, 'PENDING'>;
}
