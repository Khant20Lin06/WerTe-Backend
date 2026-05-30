import { UserRole } from '@prisma/client';

export const authTokenTypes = ['access', 'refresh'] as const;

export type AuthTokenType = (typeof authTokenTypes)[number];

export class AuthTokenPayloadEntity {
  sub!: string;
  role!: UserRole;
  sessionId!: string;
  type!: AuthTokenType;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}
