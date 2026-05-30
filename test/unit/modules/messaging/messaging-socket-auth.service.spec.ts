import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { Socket } from 'socket.io';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { AuthRepository } from '../../../../src/modules/auth/repositories/auth.repository';
import { MessagingSocketAuthService } from '../../../../src/modules/messaging/services/messaging-socket-auth.service';
import { UsersService } from '../../../../src/modules/users/services/users.service';

describe('MessagingSocketAuthService', () => {
  it('authenticates a socket from a bearer token header', async () => {
    const configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'jwt.accessSecret':
            return 'secret';
          case 'jwt.issuer':
            return 'issuer';
          case 'jwt.audience':
            return 'audience';
          default:
            return key;
        }
      }),
    };
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'usr_1',
        role: UserRole.CUSTOMER,
        sessionId: 'sess_1',
        type: 'access',
      }),
    } as unknown as jest.Mocked<JwtService>;
    const authRepository = {
      findSessionById: jest.fn().mockResolvedValue({
        id: 'sess_1',
        userId: 'usr_1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: {
          id: 'usr_1',
          role: UserRole.CUSTOMER,
          phone: '09123456789',
          status: UserStatus.ACTIVE,
        },
      }),
    } as unknown as jest.Mocked<AuthRepository>;
    const usersService = {
      isSuspended: jest.fn().mockReturnValue(false),
      isPending: jest.fn().mockReturnValue(false),
      buildActorContext: jest.fn().mockReturnValue({
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      }),
    } as unknown as jest.Mocked<UsersService>;
    const service = new MessagingSocketAuthService(
      configService as never,
      jwtService,
      authRepository,
      usersService,
    );

    const result = await service.authenticateClient({
      handshake: {
        auth: {},
        headers: {
          authorization: 'Bearer access-token',
        },
      },
    } as unknown as Socket);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
      secret: 'secret',
      issuer: 'issuer',
      audience: 'audience',
    });
    expect(result).toMatchObject({
      userId: 'usr_1',
      sessionId: 'sess_1',
      role: UserRole.CUSTOMER,
    });
  });

  it('rejects sockets without an access token', async () => {
    const service = new MessagingSocketAuthService(
      {} as never,
      {} as JwtService,
      {} as AuthRepository,
      {} as UsersService,
    );

    await expect(
      service.authenticateClient({
        handshake: {
          auth: {},
          headers: {},
        },
      } as unknown as Socket),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
