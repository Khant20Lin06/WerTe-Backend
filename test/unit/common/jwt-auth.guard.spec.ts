import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppException } from '../../../src/common/exceptions/app.exception';
import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('bypasses authentication for public routes', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('returns the authenticated user when passport succeeds', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    const user = {
      userId: 'usr_1',
    };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('normalizes missing authenticated user into a standard unauthorized exception', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    try {
      guard.handleRequest(null, null);
      fail('Expected guard to throw an unauthorized exception.');
    } catch (error) {
      expect(error).toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        response: expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        }),
      });
    }
  });

  it('rethrows strategy errors without masking them', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    const error = new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED);

    expect(() => guard.handleRequest(error, null)).toThrow(error);
  });
});
