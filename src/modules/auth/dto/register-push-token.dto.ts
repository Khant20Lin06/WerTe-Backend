import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({
    description: 'Stable device identifier from the mobile or web client.',
    example: 'android-device-001',
  })
  @IsString()
  @MinLength(3)
  deviceId!: string;

  @ApiProperty({
    description: 'Push notification platform for the device token.',
    enum: DevicePlatform,
    example: DevicePlatform.ANDROID,
  })
  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @ApiProperty({
    description: 'FCM or equivalent push token issued for the device.',
    example: 'fcm-token-abc-123',
  })
  @IsString()
  @MinLength(10)
  token!: string;
}
