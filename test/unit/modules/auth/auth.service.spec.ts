import { HttpStatus } from '@nestjs/common';
import { DevicePlatform, UserRole, UserStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AppException } from '../../../../src/common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { ActorContextEntity } from '../../../../src/modules/users/entities/actor-context.entity';
import { UsersService } from '../../../../src/modules/users/services/users.service';
import { AuthRepository } from '../../../../src/modules/auth/repositories/auth.repository';
import { AuthService } from '../../../../src/modules/auth/services/auth.service';
import { PasswordService } from '../../../../src/modules/auth/services/password.service';

describe('AuthService', () => {
  const actorContext: ActorContextEntity = {
    userId: 'usr_1',
    phone: '09123456789',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    customerProfileId: 'cust_prof_1',
  };

  const authenticatedUser: AuthenticatedUserEntity = {
    userId: 'usr_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext,
  };

  const userRecord = {
    id: 'usr_1',
    phone: '09123456789',
    passwordHash: 'hash',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
  };

  const merchantUserRecord = {
    ...userRecord,
    id: 'usr_merchant_1',
    phone: '+959123456780',
    role: UserRole.MERCHANT,
    merchantProfile: {
      id: 'merchant_1',
    },
  };

  const riderUserRecord = {
    ...userRecord,
    id: 'usr_rider_1',
    phone: '+959777777777',
    role: UserRole.RIDER,
    riderProfile: {
      id: 'rider_1',
    },
  };

  const configService = {
    getOrThrow: jest.fn((key: string) => {
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
  } as unknown as ConfigService;

  const jwtService = {
    signAsync: jest.fn(async (payload: { type: string; sub: string; sessionId: string }) => {
      return `${payload.type}-token-${payload.sub}-${payload.sessionId}`;
    }),
    decode: jest.fn((token: string) => {
      if (token.startsWith('refresh-token-')) {
        return { exp: Math.floor(Date.now() / 1000) + 3600 };
      }

      return { exp: Math.floor(Date.now() / 1000) + 900 };
    }),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  it('returns generic unauthorized error when user does not exist', async () => {
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(null),
    } as unknown as UsersService;
    const authRepository = {} as AuthRepository;
    const passwordService = {} as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    await expect(
      service.login({
        phone: '09999999999',
        password: 'secret',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('returns generic unauthorized error when password is invalid', async () => {
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(userRecord),
    } as unknown as UsersService;
    const authRepository = {} as AuthRepository;
    const passwordService = {
      compare: jest.fn().mockResolvedValue(false),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    await expect(
      service.login({
        phone: '09123456789',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('rejects suspended accounts after credential verification', async () => {
    const suspendedUser = {
      ...userRecord,
      status: UserStatus.SUSPENDED,
    };
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(suspendedUser),
      isSuspended: jest.fn().mockReturnValue(true),
      isPending: jest.fn().mockReturnValue(false),
    } as unknown as UsersService;
    const authRepository = {} as AuthRepository;
    const passwordService = {
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    await expect(
      service.login({
        phone: '09123456789',
        password: 'secret',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('returns actor context for an active user with valid credentials', async () => {
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(userRecord),
      isSuspended: jest.fn().mockReturnValue(false),
      isPending: jest.fn().mockReturnValue(false),
      buildActorContext: jest.fn().mockReturnValue(actorContext),
    } as unknown as UsersService;
    const authRepository = {
      createSession: jest.fn().mockResolvedValue(undefined),
      touchLastLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthRepository;
    const passwordService = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('hashed-refresh-token'),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    const result = await service.login({
      phone: '09123456789',
      password: 'secret',
    });

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
    } as unknown as UsersService;
    const authRepository = {
      createCustomerAccount: jest.fn().mockResolvedValue(registeredUser),
      createSession: jest.fn().mockResolvedValue(undefined),
      touchLastLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthRepository;
    const passwordService = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    const result = await service.registerCustomer(
      {
        phone: '09123456789',
        password: 'Customer@1234',
        fullName: 'Mg Mg',
      },
      {
        deviceId: 'web-1',
      },
    );

    expect(passwordService.hash).toHaveBeenCalledWith('Customer@1234');
    expect(authRepository.createCustomerAccount).toHaveBeenCalledWith({
      phone: '09123456789',
      passwordHash: 'hashed-password',
      fullName: 'Mg Mg',
      avatarUrl: null,
    });
    expect(authRepository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr_1',
        deviceId: 'web-1',
      }),
    );
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
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    };
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(null),
      buildActorContext: jest.fn().mockReturnValue(merchantActorContext),
    } as unknown as UsersService;
    const authRepository = {
      createMerchantAccount: jest.fn().mockResolvedValue(merchantUserRecord),
      createSession: jest.fn().mockResolvedValue(undefined),
      touchLastLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthRepository;
    const passwordService = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

    const result = await service.registerMerchant({
      phone: '+959123456780',
      password: 'Merchant@1234',
      name: 'Tea House',
      supportPhone: '+95942000000',
      storeType: ' Grocery ' as 'grocery',
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
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      riderId: 'rider_1',
    };
    const usersService = {
      findByPhone: jest.fn().mockResolvedValue(null),
      buildActorContext: jest.fn().mockReturnValue(riderActorContext),
    } as unknown as UsersService;
    const authRepository = {
      createRiderAccount: jest.fn().mockResolvedValue(riderUserRecord),
      createSession: jest.fn().mockResolvedValue(undefined),
      touchLastLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthRepository;
    const passwordService = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
    } as unknown as PasswordService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      authRepository,
      passwordService,
    );

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
    } as unknown as UsersService;
    const service = new AuthService(
      configService,
      jwtService,
      usersService,
      {} as AuthRepository,
      {} as PasswordService,
    );

    await expect(
      service.registerCustomer({
        phone: '09123456789',
        password: 'Customer@1234',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });
  });

  it('rotates a valid refresh token into a new token pair', async () => {
    const usersService = {
      isSuspended: jest.fn().mockReturnValue(false),
      isPending: jest.fn().mockReturnValue(false),
      buildActorContext: jest.fn().mockReturnValue(actorContext),
    } as unknown as UsersService;
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
    } as unknown as AuthRepository;
    const passwordService = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('new-refresh-hash'),
    } as unknown as PasswordService;
    const localJwtService = {
      ...jwtService,
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'session_1',
        type: 'refresh',
      }),
    } as unknown as JwtService;
    const service = new AuthService(
      configService,
      localJwtService,
      usersService,
      authRepository,
      passwordService,
    );

    const result = await service.refreshSession('refresh-token');

    expect(authRepository.findSessionById).toHaveBeenCalledWith('session_1');
    expect(authRepository.rotateSession).toHaveBeenCalledWith(
      'session_1',
      'new-refresh-hash',
      expect.any(Date),
      {},
    );
    expect(result).toEqual({
      accessToken: 'access-token-usr_1-session_1',
      refreshToken: 'refresh-token-usr_1-session_1',
      sessionId: 'session_1',
      userId: 'usr_1',
      actorContext,
    });
  });

  it('rejects revoked sessions during refresh', async () => {
    const usersService = {} as UsersService;
    const authRepository = {
      findSessionById: jest.fn().mockResolvedValue({
        id: 'session_1',
        userId: 'usr_1',
        refreshTokenHash: 'stored-refresh-hash',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        user: userRecord,
      }),
    } as unknown as AuthRepository;
    const passwordService = {} as PasswordService;
    const localJwtService = {
      ...jwtService,
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'session_1',
        type: 'refresh',
      }),
    } as unknown as JwtService;
    const service = new AuthService(
      configService,
      localJwtService,
      usersService,
      authRepository,
      passwordService,
    );

    await expect(service.refreshSession('refresh-token')).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('returns current authenticated session context', () => {
    const service = new AuthService(
      configService,
      jwtService,
      {} as UsersService,
      {} as AuthRepository,
      {} as PasswordService,
    );

    expect(service.getCurrentSession(authenticatedUser)).toEqual({
      userId: 'usr_1',
      sessionId: 'session_1',
      role: UserRole.CUSTOMER,
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
    } as unknown as AuthRepository;
    const service = new AuthService(
      configService,
      jwtService,
      {} as UsersService,
      authRepository,
      {} as PasswordService,
    );

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
    } as unknown as AuthRepository;
    const service = new AuthService(
      configService,
      jwtService,
      {} as UsersService,
      authRepository,
      {} as PasswordService,
    );

    await expect(
      service.logout(authenticatedUser, {
        sessionId: 'session_2',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
      response: expect.objectContaining({
        code: ErrorCodes.forbidden,
      }),
    });
  });

  it('registers a push token for the authenticated user', async () => {
    const pushTokenRecord = {
      id: 'push_1',
      userId: 'usr_1',
      deviceId: 'android-device-001',
      platform: DevicePlatform.ANDROID,
      token: 'fcm-token-abc-123',
      lastSeenAt: new Date('2026-04-19T08:00:00.000Z'),
      createdAt: new Date('2026-04-19T08:00:00.000Z'),
      updatedAt: new Date('2026-04-19T08:00:00.000Z'),
    };
    const authRepository = {
      registerPushToken: jest.fn().mockResolvedValue(pushTokenRecord),
    } as unknown as AuthRepository;
    const service = new AuthService(
      configService,
      jwtService,
      {} as UsersService,
      authRepository,
      {} as PasswordService,
    );

    await expect(
      service.registerPushToken(authenticatedUser, {
        deviceId: 'android-device-001',
        platform: DevicePlatform.ANDROID,
        token: 'fcm-token-abc-123',
      }),
    ).resolves.toEqual(pushTokenRecord);

    expect(authRepository.registerPushToken).toHaveBeenCalledWith({
      userId: 'usr_1',
      deviceId: 'android-device-001',
      platform: DevicePlatform.ANDROID,
      token: 'fcm-token-abc-123',
    });
  });

  it('unregisters a push token device for the authenticated user', async () => {
    const authRepository = {
      unregisterPushToken: jest.fn().mockResolvedValue({ count: 1 }),
    } as unknown as AuthRepository;
    const service = new AuthService(
      configService,
      jwtService,
      {} as UsersService,
      authRepository,
      {} as PasswordService,
    );

    await expect(
      service.unregisterPushToken(authenticatedUser, 'android-device-001'),
    ).resolves.toEqual({
      deviceId: 'android-device-001',
    });

    expect(authRepository.unregisterPushToken).toHaveBeenCalledWith(
      'usr_1',
      'android-device-001',
    );
  });
});
