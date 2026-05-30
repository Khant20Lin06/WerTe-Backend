import { Request } from 'express';

import { AuthenticatedUserEntity } from './authenticated-user.entity';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserEntity;
}
