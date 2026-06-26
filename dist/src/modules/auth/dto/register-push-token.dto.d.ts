import { DevicePlatform } from '@prisma/client';
export declare class RegisterPushTokenDto {
    deviceId: string;
    platform: DevicePlatform;
    token: string;
}
