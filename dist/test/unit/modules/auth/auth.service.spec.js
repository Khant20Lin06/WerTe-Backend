"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const auth_service_1 = require("../../../../src/modules/auth/services/auth.service");
describe('AuthService', () => {
    const actorContext = {
        userId: 'usr_1',
        phone: '09123456789',
        role: client_1.UserRole.CUSTOMER,
        status: client_1.UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
    };
    const authenticatedUser = {
        userId: 'usr_1',
        sessionId: 'session_1',
        role: client_1.UserRole.CUSTOMER,
        tokenType: 'access',
        actorContext,
    };
    const userRecord = {
        id: 'usr_1',
        phone: '09123456789',
        passwordHash: 'hash',
        role: client_1.UserRole.CUSTOMER,
        status: client_1.UserStatus.ACTIVE,
    };
    const merchantUserRecord = {
        ...userRecord,
        id: 'usr_merchant_1',
        phone: '+959123456780',
        role: client_1.UserRole.MERCHANT,
        merchantProfile: {
            id: 'merchant_1',
        },
    };
    const riderUserRecord = {
        ...userRecord,
        id: 'usr_rider_1',
        phone: '+959777777777',
        role: client_1.UserRole.RIDER,
        riderProfile: {
            id: 'rider_1',
        },
    };
    const configService = {
        getOrThrow: jest.fn((key) => {
            switch (key) {
                case 'jwt.accessSecret':
                    return 'access-secret-value';
                case 'jwt.refreshSecret':
                    return 'refresh-secret-value';
                case 'jwt.accessExpiresIn':
                    return '15m';
                case 'jwt.refreshExpiresIn':
                    return '30d';
                case 'jwt.issuer':
                    return 'food-delivery-backend';
                case 'jwt.audience':
                    return 'food-delivery-platform';
                default:
                    throw new Error(`Unexpected config key: ${key}`);
            }
        }),
    };
    const jwtService = {
        signAsync: jest.fn(async (payload) => {
            return `${payload.type}-token-${payload.sub}-${payload.sessionId}`;
        }),
        decode: jest.fn((token) => {
            if (token.startsWith('refresh-token-')) {
                return { exp: Math.floor(Date.now() / 1000) + 3600 };
            }
            return { exp: Math.floor(Date.now() / 1000) + 900 };
        }),
        verifyAsync: jest.fn(),
    };
    it('returns generic unauthorized error when user does not exist', async () => {
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(null),
        };
        const authRepository = {};
        const passwordService = {};
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        await expect(service.login({
            phone: '09999999999',
            password: 'secret',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
    it('returns generic unauthorized error when password is invalid', async () => {
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(userRecord),
        };
        const authRepository = {};
        const passwordService = {
            compare: jest.fn().mockResolvedValue(false),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        await expect(service.login({
            phone: '09123456789',
            password: 'wrong-password',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
    it('rejects suspended accounts after credential verification', async () => {
        const suspendedUser = {
            ...userRecord,
            status: client_1.UserStatus.SUSPENDED,
        };
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(suspendedUser),
            isSuspended: jest.fn().mockReturnValue(true),
            isPending: jest.fn().mockReturnValue(false),
        };
        const authRepository = {};
        const passwordService = {
            compare: jest.fn().mockResolvedValue(true),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        await expect(service.login({ phone: '09123456789', password: 'secret' }, {}, 'customer')).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
        });
    });
    it('returns actor context for an active user with valid credentials', async () => {
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(userRecord),
            isSuspended: jest.fn().mockReturnValue(false),
            isPending: jest.fn().mockReturnValue(false),
            buildActorContext: jest.fn().mockReturnValue(actorContext),
        };
        const authRepository = {
            createSession: jest.fn().mockResolvedValue(undefined),
            touchLastLogin: jest.fn().mockResolvedValue(undefined),
        };
        const passwordService = {
            compare: jest.fn().mockResolvedValue(true),
            hash: jest.fn().mockResolvedValue('hashed-refresh-token'),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        const result = await service.login({ phone: '09123456789', password: 'secret' }, {}, 'customer');
        expect(authRepository.createSession).toHaveBeenCalled();
        expect(authRepository.touchLastLogin).toHaveBeenCalledWith('usr_1');
        expect(result).toEqual({
            accessToken: expect.stringMatching(/^access-token-usr_1-/),
            refreshToken: expect.stringMatching(/^refresh-token-usr_1-/),
            sessionId: expect.any(String),
            userId: 'usr_1',
            actorContext,
        });
    });
    it('registers a customer account and returns a token pair', async () => {
        const registeredUser = {
            ...userRecord,
            customerProfile: {
                id: 'cust_prof_1',
            },
        };
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(null),
            buildActorContext: jest.fn().mockReturnValue(actorContext),
        };
        const authRepository = {
            createCustomerAccount: jest.fn().mockResolvedValue(registeredUser),
            createSession: jest.fn().mockResolvedValue(undefined),
            touchLastLogin: jest.fn().mockResolvedValue(undefined),
        };
        const passwordService = {
            hash: jest.fn().mockResolvedValue('hashed-password'),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        const result = await service.registerCustomer({
            phone: '09123456789',
            password: 'Customer@1234',
            fullName: 'Mg Mg',
        }, {
            deviceId: 'web-1',
        });
        expect(passwordService.hash).toHaveBeenCalledWith('Customer@1234');
        expect(authRepository.createCustomerAccount).toHaveBeenCalledWith({
            phone: '09123456789',
            passwordHash: 'hashed-password',
            fullName: 'Mg Mg',
            avatarUrl: null,
        });
        expect(authRepository.createSession).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'usr_1',
            deviceId: 'web-1',
        }));
        expect(result).toMatchObject({
            accessToken: expect.stringMatching(/^access-token-usr_1-/),
            refreshToken: expect.stringMatching(/^refresh-token-usr_1-/),
            userId: 'usr_1',
            actorContext,
        });
    });
    it('registers a merchant account with normalized store type', async () => {
        const merchantActorContext = {
            userId: 'usr_merchant_1',
            phone: '+959123456780',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        };
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(null),
            buildActorContext: jest.fn().mockReturnValue(merchantActorContext),
        };
        const authRepository = {
            createMerchantAccount: jest.fn().mockResolvedValue(merchantUserRecord),
            createSession: jest.fn().mockResolvedValue(undefined),
            touchLastLogin: jest.fn().mockResolvedValue(undefined),
        };
        const passwordService = {
            hash: jest.fn().mockResolvedValue('hashed-password'),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        const result = await service.registerMerchant({
            phone: '+959123456780',
            password: 'Merchant@1234',
            name: 'Tea House',
            supportPhone: '+95942000000',
            storeType: ' Grocery ',
        });
        expect(authRepository.createMerchantAccount).toHaveBeenCalledWith({
            phone: '+959123456780',
            passwordHash: 'hashed-password',
            name: 'Tea House',
            supportPhone: '+95942000000',
            storeType: 'grocery',
        });
        expect(result.actorContext).toEqual(merchantActorContext);
    });
    it('registers a rider account and returns rider actor context', async () => {
        const riderActorContext = {
            userId: 'usr_rider_1',
            phone: '+959777777777',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        };
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(null),
            buildActorContext: jest.fn().mockReturnValue(riderActorContext),
        };
        const authRepository = {
            createRiderAccount: jest.fn().mockResolvedValue(riderUserRecord),
            createSession: jest.fn().mockResolvedValue(undefined),
            touchLastLogin: jest.fn().mockResolvedValue(undefined),
        };
        const passwordService = {
            hash: jest.fn().mockResolvedValue('hashed-password'),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, authRepository, passwordService);
        const result = await service.registerRider({
            phone: '+959777777777',
            password: 'Rider@1234',
            displayName: 'Ko Aung',
            vehicleType: 'bike',
            currentTownship: 'Kamaryut',
        });
        expect(authRepository.createRiderAccount).toHaveBeenCalledWith({
            phone: '+959777777777',
            passwordHash: 'hashed-password',
            displayName: 'Ko Aung',
            vehicleType: 'bike',
            currentTownship: 'Kamaryut',
        });
        expect(result.actorContext).toEqual(riderActorContext);
    });
    it('rejects registration when phone already exists', async () => {
        const usersService = {
            findByPhone: jest.fn().mockResolvedValue(userRecord),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, usersService, {}, {});
        await expect(service.registerCustomer({
            phone: '09123456789',
            password: 'Customer@1234',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
    it('rotates a valid refresh token into a new token pair', async () => {
        const usersService = {
            isSuspended: jest.fn().mockReturnValue(false),
            isPending: jest.fn().mockReturnValue(false),
            buildActorContext: jest.fn().mockReturnValue(actorContext),
        };
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_1',
                userId: 'usr_1',
                refreshTokenHash: 'stored-refresh-hash',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 60_000),
                user: userRecord,
            }),
            rotateSession: jest.fn().mockResolvedValue(undefined),
        };
        const passwordService = {
            compare: jest.fn().mockResolvedValue(true),
            hash: jest.fn().mockResolvedValue('new-refresh-hash'),
        };
        const localJwtService = {
            ...jwtService,
            verifyAsync: jest.fn().mockResolvedValue({
                sub: 'usr_1',
                role: client_1.UserRole.CUSTOMER,
                sessionId: 'session_1',
                type: 'refresh',
            }),
        };
        const service = new auth_service_1.AuthService(configService, localJwtService, usersService, authRepository, passwordService);
        const result = await service.refreshSession('refresh-token');
        expect(authRepository.findSessionById).toHaveBeenCalledWith('session_1');
        expect(authRepository.rotateSession).toHaveBeenCalledWith('session_1', 'new-refresh-hash', expect.any(Date), {});
        expect(result).toEqual({
            accessToken: 'access-token-usr_1-session_1',
            refreshToken: 'refresh-token-usr_1-session_1',
            sessionId: 'session_1',
            userId: 'usr_1',
            actorContext,
        });
    });
    it('rejects revoked sessions during refresh', async () => {
        const usersService = {};
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_1',
                userId: 'usr_1',
                refreshTokenHash: 'stored-refresh-hash',
                revokedAt: new Date(),
                expiresAt: new Date(Date.now() + 60_000),
                user: userRecord,
            }),
        };
        const passwordService = {};
        const localJwtService = {
            ...jwtService,
            verifyAsync: jest.fn().mockResolvedValue({
                sub: 'usr_1',
                role: client_1.UserRole.CUSTOMER,
                sessionId: 'session_1',
                type: 'refresh',
            }),
        };
        const service = new auth_service_1.AuthService(configService, localJwtService, usersService, authRepository, passwordService);
        await expect(service.refreshSession('refresh-token')).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
    it('returns current authenticated session context', () => {
        const service = new auth_service_1.AuthService(configService, jwtService, {}, {}, {});
        expect(service.getCurrentSession(authenticatedUser)).toEqual({
            userId: 'usr_1',
            sessionId: 'session_1',
            role: client_1.UserRole.CUSTOMER,
            actorContext,
        });
    });
    it('revokes the current session when logout payload is empty', async () => {
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_1',
                userId: 'usr_1',
            }),
            revokeSession: jest.fn().mockResolvedValue({ count: 1 }),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, {}, authRepository, {});
        const result = await service.logout(authenticatedUser);
        expect(authRepository.findSessionById).toHaveBeenCalledWith('session_1');
        expect(authRepository.revokeSession).toHaveBeenCalledWith('session_1');
        expect(result).toEqual({
            revokedSessionId: 'session_1',
        });
    });
    it('rejects logout attempts for sessions owned by another user', async () => {
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'session_2',
                userId: 'usr_other',
            }),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, {}, authRepository, {});
        await expect(service.logout(authenticatedUser, {
            sessionId: 'session_2',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.forbidden,
            }),
        });
    });
    it('registers a push token for the authenticated user', async () => {
        const pushTokenRecord = {
            id: 'push_1',
            userId: 'usr_1',
            deviceId: 'android-device-001',
            platform: client_1.DevicePlatform.ANDROID,
            token: 'fcm-token-abc-123',
            lastSeenAt: new Date('2026-04-19T08:00:00.000Z'),
            createdAt: new Date('2026-04-19T08:00:00.000Z'),
            updatedAt: new Date('2026-04-19T08:00:00.000Z'),
        };
        const authRepository = {
            registerPushToken: jest.fn().mockResolvedValue(pushTokenRecord),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, {}, authRepository, {});
        await expect(service.registerPushToken(authenticatedUser, {
            deviceId: 'android-device-001',
            platform: client_1.DevicePlatform.ANDROID,
            token: 'fcm-token-abc-123',
        })).resolves.toEqual(pushTokenRecord);
        expect(authRepository.registerPushToken).toHaveBeenCalledWith({
            userId: 'usr_1',
            deviceId: 'android-device-001',
            platform: client_1.DevicePlatform.ANDROID,
            token: 'fcm-token-abc-123',
        });
    });
    it('unregisters a push token device for the authenticated user', async () => {
        const authRepository = {
            unregisterPushToken: jest.fn().mockResolvedValue({ count: 1 }),
        };
        const service = new auth_service_1.AuthService(configService, jwtService, {}, authRepository, {});
        await expect(service.unregisterPushToken(authenticatedUser, 'android-device-001')).resolves.toEqual({
            deviceId: 'android-device-001',
        });
        expect(authRepository.unregisterPushToken).toHaveBeenCalledWith('usr_1', 'android-device-001');
    });
});
//# sourceMappingURL=auth.service.spec.js.map