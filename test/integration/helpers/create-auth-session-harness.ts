import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../../src/modules/auth/entities/authenticated-user.entity';
import { AuthRepository } from '../../../src/modules/auth/repositories/auth.repository';
import {
  ActorContextEntity,
  buildActorContext,
} from '../../../src/modules/users/entities/actor-context.entity';
import { UsersService } from '../../../src/modules/users/services/users.service';

type IntegrationActorInput = {
  key: string;
  userId: string;
  role: UserRole;
  phone: string;
  sessionId: string;
  status?: UserStatus;
  customerProfileId?: string;
  merchantId?: string;
  riderId?: string;
};

type IntegrationSessionUser = {
  id: string;
  role: UserRole;
  phone: string;
  status: UserStatus;
  customerProfile: { id: string } | null;
  merchantProfile: { id: string } | null;
  riderProfile: { id: string } | null;
};

type IntegrationActorFixture = {
  key: string;
  accessToken: string;
  actorContext: ActorContextEntity;
  currentUser: AuthenticatedUserEntity;
  session: {
    id: string;
    userId: string;
    revokedAt: Date | null;
    expiresAt: Date;
    user: IntegrationSessionUser;
  };
};

function buildSessionUser(input: IntegrationActorInput): IntegrationSessionUser {
  return {
    id: input.userId,
    role: input.role,
    phone: input.phone,
    status: input.status ?? UserStatus.ACTIVE,
    customerProfile:
      input.customerProfileId === undefined
        ? null
        : { id: input.customerProfileId },
    merchantProfile:
      input.merchantId === undefined ? null : { id: input.merchantId },
    riderProfile: input.riderId === undefined ? null : { id: input.riderId },
  };
}

export async function createAuthSessionHarness<
  const TActors extends readonly IntegrationActorInput[],
>(inputs: TActors): Promise<{
  authRepository: jest.Mocked<Partial<AuthRepository>>;
  usersService: jest.Mocked<Partial<UsersService>>;
  actors: Record<TActors[number]['key'], IntegrationActorFixture>;
}> {
  const jwtService = new JwtService();
  const fixtures = {} as Record<TActors[number]['key'], IntegrationActorFixture>;
  const sessions = new Map<
    string,
    IntegrationActorFixture['session']
  >();

  for (const input of inputs) {
    const user = buildSessionUser(input);
    const actorContext = buildActorContext(user as never);
    const accessToken = await jwtService.signAsync(
      {
        sub: input.userId,
        role: input.role,
        sessionId: input.sessionId,
        type: 'access',
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        expiresIn: '15m',
      },
    );
    const session = {
      id: input.sessionId,
      userId: input.userId,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      user,
    };

    sessions.set(input.sessionId, session);
    fixtures[input.key as TActors[number]['key']] = {
      key: input.key,
      accessToken,
      actorContext,
      currentUser: {
        userId: input.userId,
        sessionId: input.sessionId,
        role: input.role,
        tokenType: 'access',
        actorContext,
      },
      session,
    };
  }

  const usersService = {
    buildActorContext: jest.fn((user: IntegrationSessionUser) =>
      buildActorContext(user as never),
    ),
    isSuspended: jest.fn(
      (user: IntegrationSessionUser) => user.status === UserStatus.SUSPENDED,
    ),
    isPending: jest.fn(
      (user: IntegrationSessionUser) => user.status === UserStatus.PENDING,
    ),
    findById: jest.fn(),
    findByPhone: jest.fn(),
    findActiveByPhone: jest.fn(),
    findActorContextById: jest.fn(),
  } as jest.Mocked<Partial<UsersService>>;

  const authRepository = {
    findSessionById: jest.fn(async (sessionId: string) => {
      return sessions.get(sessionId) ?? null;
    }),
    createSession: jest.fn(),
    rotateSession: jest.fn(),
    revokeSession: jest.fn(),
    registerPushToken: jest.fn(),
    touchLastLogin: jest.fn(),
  } as jest.Mocked<Partial<AuthRepository>>;

  return {
    authRepository,
    usersService,
    actors: fixtures,
  };
}
