import { ApiProperty } from '@nestjs/swagger';

export class UnregisterPushTokenResponseDto {
  @ApiProperty({
    description: 'Device identifier whose push token registration was removed.',
    example: 'android-device-001',
  })
  deviceId!: string;
}
