import { DevicePlatform } from '@prisma/client';
export declare class PushTokenResponseDto {
    id: string;
    userId: string;
    deviceId: string;
    platform: DevicePlatform;
    token: string;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
