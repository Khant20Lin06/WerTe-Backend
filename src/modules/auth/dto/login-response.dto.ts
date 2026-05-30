import { ApiProperty } from '@nestjs/swagger';

import { ActorContextDto } from './actor-context.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Short-lived access token used for authenticated API requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Long-lived refresh token used to rotate the access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Server-side session identifier backing the token pair.',
    example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'Authenticated user identifier.',
    example: 'usr_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Resolved actor context for the authenticated session.',
    type: ActorContextDto,
  })
  actorContext!: ActorContextDto;
}
