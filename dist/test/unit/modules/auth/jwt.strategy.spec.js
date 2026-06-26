"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_strategy_1 = require("../../../../src/modules/auth/strategies/jwt.strategy");
describe('JwtStrategy', () => {
    const configService = {
        getOrThrow: jest.fn((key) => {
            switch (key) {
                case 'jwt.accessSecret':
                    return 'access-secret';
                case 'jwt.issuer':
                    return 'food-delivery-backend';
                case 'jwt.audience':
                    return 'food-delivery-platform';
                default:
                    throw new Error(`Unexpected config key: ${key}`);
            }
        }),
    };
    const noOpCache = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
        invalidate: jest.fn().mockResolvedValue(undefined),
        buildAuthenticatedUser: jest.fn(),
    };
    const userRecord = {
        id: 'usr_1',
        phone: '09123456789',
        passwordHash: 'hash',
        role: client_1.UserRole.CUSTOMER,
        status: client_1.UserStatus.ACTIVE,
        customerProfile: { id: 'cust_prof_1' },
        riderProfile: null,
        merchantProfile: null,
        staffProfile: null,
    };
    it('returns authenticated actor context for a valid access token', async () => {
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_1',
                userId: 'usr_1',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 60_000),
                user: userRecord,
            }),
        };
        const usersService = {
            isSuspended: jest.fn().mockReturnValue(false),
            isPending: jest.fn().mockReturnValue(false),
            buildActorContext: jest.fn().mockReturnValue({
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            }),
        };
        const strategy = new jwt_strategy_1.JwtStrategy(configService, authRepository, usersService, noOpCache);
        await expect(strategy.validate({
            sub: 'usr_1',
            role: client_1.UserRole.CUSTOMER,
            sessionId: 'session_1',
            type: 'access',
            exp: Math.floor(Date.now() / 1_000) + 900,
        })).resolves.toEqual({
            userId: 'usr_1',
            sessionId: 'session_1',
            role: client_1.UserRole.CUSTOMER,
            tokenType: 'access',
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
    });
    it('rejects non-access tokens for guarded routes', async () => {
        const strategy = new jwt_strategy_1.JwtStrategy(configService, {}, {}, noOpCache);
        await expect(strategy.validate({
            sub: 'usr_1',
            role: client_1.UserRole.CUSTOMER,
            sessionId: 'session_1',
            type: 'refresh',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
    it('rejects revoked sessions', async () => {
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_1',
                userId: 'usr_1',
                revokedAt: new Date(),
                expiresAt: new Date(Date.now() + 60_000),
                user: userRecord,
            }),
        };
        const strategy = new jwt_strategy_1.JwtStrategy(configService, authRepository, {}, noOpCache);
        await expect(strategy.validate({
            sub: 'usr_1',
            role: client_1.UserRole.CUSTOMER,
            sessionId: 'session_1',
            type: 'access',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
    it('returns from cache without hitting the database', async () => {
        const cachedSession = {
            userId: 'usr_1',
            revokedAt: null,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            user: userRecord,
        };
        const cacheHit = {
            get: jest.fn().mockResolvedValue(cachedSession),
            set: jest.fn(),
            invalidate: jest.fn(),
            buildAuthenticatedUser: jest.fn().mockReturnValue({
                userId: 'usr_1',
                sessionId: 'session_1',
                role: client_1.UserRole.CUSTOMER,
                tokenType: 'access',
                actorContext: {},
            }),
        };
        const dbRepository = {
            findSessionById: jest.fn(),
        };
        const usersService = {
            isSuspended: jest.fn().mockReturnValue(false),
            isPending: jest.fn().mockReturnValue(false),
        };
        const strategy = new jwt_strategy_1.JwtStrategy(configService, dbRepository, usersService, cacheHit);
        await strategy.validate({
            sub: 'usr_1',
            role: client_1.UserRole.CUSTOMER,
            sessionId: 'session_1',
            type: 'access',
        });
        expect(dbRepository.findSessionById).not.toHaveBeenCalled();
        expect(cacheHit.get).toHaveBeenCalledWith('session_1');
    });
});
//# sourceMappingURL=jwt.strategy.spec.js.map