import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description:
      'Target session identifier to revoke. When omitted, the current access-token session is revoked.',
    example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description:
      'Optional refresh token for the target session. Useful when revoking a non-current session owned by the same actor.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  refreshToken?: string;
}
