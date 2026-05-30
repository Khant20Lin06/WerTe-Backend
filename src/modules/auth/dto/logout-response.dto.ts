import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Identifier of the session that was revoked.',
    example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
  })
  revokedSessionId!: string;
}
