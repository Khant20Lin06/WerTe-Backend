import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthTokenPayloadEntity } from '../entities/auth-token-payload.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { SessionCacheService } from '../services/session-cache.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authRepository;
    private readonly usersService;
    private readonly sessionCache;
    constructor(configService: ConfigService, authRepository: AuthRepository, usersService: UsersService, sessionCache: SessionCacheService);
    validate(payload: AuthTokenPayloadEntity): Promise<AuthenticatedUserEntity>;
    private validateCached;
    private validateFromDb;
}
export {};
