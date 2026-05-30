import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { ActorContextDto } from './actor-context.dto';

export class AuthMeResponseDto {
  @ApiProperty({
    description: 'Authenticated user identifier.',
    example: 'usr_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Current session identifier.',
    example: '8e6f237c-2f7b-4d76-b77b-c86393c8d8e8',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'Resolved role for the current session.',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Actor context resolved from the authenticated session.',
    type: ActorContextDto,
  })
  actorContext!: ActorContextDto;
}
