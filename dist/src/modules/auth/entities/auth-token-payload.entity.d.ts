import { UserRole } from '@prisma/client';
export declare const authTokenTypes: readonly ["access", "refresh"];
export type AuthTokenType = (typeof authTokenTypes)[number];
export declare class AuthTokenPayloadEntity {
    sub: string;
    role: UserRole;
    sessionId: string;
    type: AuthTokenType;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string | string[];
}
