import { UserRole } from '@prisma/client';

import { ActorContextEntity } from '../../users/entities/actor-context.entity';
import { AuthTokenType } from './auth-token-payload.entity';

export class AuthenticatedUserEntity {
  userId!: string;
  sessionId!: string;
  role!: UserRole;
  tokenType!: AuthTokenType;
  actorContext!: ActorContextEntity;
}
