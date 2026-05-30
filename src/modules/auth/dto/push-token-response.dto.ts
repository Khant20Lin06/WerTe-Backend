import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '@prisma/client';

export class PushTokenResponseDto {
  @ApiProperty({
    description: 'Push token record identifier.',
    example: 'pt_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Owner user id for the registered push token.',
    example: 'usr_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Client-provided stable device identifier.',
    example: 'android-device-001',
  })
  deviceId!: string;

  @ApiProperty({
    description: 'Registered platform for this token.',
    enum: DevicePlatform,
    example: DevicePlatform.ANDROID,
  })
  platform!: DevicePlatform;

  @ApiProperty({
    description: 'Stored push token.',
    example: 'fcm-token-abc-123',
  })
  token!: string;

  @ApiProperty({
    description: 'Last time this token was seen or refreshed.',
    example: '2026-04-19T08:00:00.000Z',
  })
  lastSeenAt!: Date;

  @ApiProperty({
    description: 'Creation timestamp for the token record.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp for the token record.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: Date;
}
