import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException, ThrottlerRequest } from '@nestjs/throttler';

import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { IpAwareThrottlerGuard } from '../../../src/common/guards/throttler.guard';

describe('IpAwareThrottlerGuard', () => {
  const makeLogger = () =>
    ({ warnEvent: jest.fn() }) as unknown as jest.Mocked<AppLogger>;

  const makeContext = (ip = '203.0.113.7'): ExecutionContext => {
    const req = { headers: {}, ip, socket: { remoteAddress: ip } };
    const res = { header: jest.fn() };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getClass: () => ({ name: 'TestController' }) as unknown as new (...args: unknown[]) => unknown,
      getHandler: () => ({ name: 'testHandler' }) as unknown as (...args: unknown[]) => unknown,
    } as unknown as ExecutionContext;
  };

  const makeRequestProps = (
    context: ExecutionContext,
    overrides?: Partial<ThrottlerRequest>,
  ): ThrottlerRequest => ({
    context,
    limit: 3,
    ttl: 10_000,
    throttler: { name: 'short', limit: 3, ttl: 10_000 },
    blockDuration: 10_000,
    getTracker: async (req: Record<string, unknown>) => req.ip as string,
    generateKey: (_ctx, tracker, name) => `${name}:${tracker}`,
    ...overrides,
  });

  // storageService.increment is what the base handleRequest() calls.
  const makeGuard = async (incrementImpl: () => Promise<unknown>) => {
    const storageService = { increment: jest.fn(incrementImpl) };
    const logger = makeLogger();
    const guard = new IpAwareThrottlerGuard(
      [{ name: 'short', ttl: 1_000, limit: 10 }] as never,
      storageService as never,
      new Reflector(),
      logger,
    );
    // The base ThrottlerGuard builds `commonOptions` in onModuleInit(),
    // which Nest's DI container calls automatically — since this test
    // constructs the guard directly with `new`, that hook has to be invoked
    // by hand or every handleRequest() call throws reading
    // this.commonOptions before it ever gets near our overrides.
    await (guard as unknown as { onModuleInit: () => Promise<void> }).onModuleInit();
    return { guard, logger, storageService };
  };

  const REDIS_DOWN = () => Promise.reject(new Error('connect ETIMEDOUT'));

  it('falls back to the in-memory limiter and allows requests under the limit', async () => {
    const { guard } = await makeGuard(REDIS_DOWN);
    const context = makeContext('203.0.113.7');

    const allowed = await (
      guard as unknown as {
        handleRequest: (props: ThrottlerRequest) => Promise<boolean>;
      }
    ).handleRequest(makeRequestProps(context));

    expect(allowed).toBe(true);
  });

  it('blocks once the fallback limit is exceeded for the same tracker', async () => {
    const { guard } = await makeGuard(REDIS_DOWN);
    const context = makeContext('203.0.113.9');
    const handle = (
      guard as unknown as {
        handleRequest: (props: ThrottlerRequest) => Promise<boolean>;
      }
    ).handleRequest.bind(guard);

    // limit is 3 in makeRequestProps — first 3 succeed, 4th is blocked.
    await handle(makeRequestProps(context));
    await handle(makeRequestProps(context));
    await handle(makeRequestProps(context));

    await expect(handle(makeRequestProps(context))).rejects.toThrow(
      HttpException,
    );
  });

  it('tracks distinct IPs independently in the fallback limiter', async () => {
    const { guard } = await makeGuard(REDIS_DOWN);
    const handle = (
      guard as unknown as {
        handleRequest: (props: ThrottlerRequest) => Promise<boolean>;
      }
    ).handleRequest.bind(guard);

    const contextA = makeContext('203.0.113.10');
    const contextB = makeContext('203.0.113.11');

    // Exhaust the limit for A only.
    await handle(makeRequestProps(contextA));
    await handle(makeRequestProps(contextA));
    await handle(makeRequestProps(contextA));

    // B has made no requests yet, so it must still be allowed.
    await expect(handle(makeRequestProps(contextB))).resolves.toBe(true);
  });

  it('still throws ThrottlerException for a genuine rate-limit rejection (storage reachable, caller is over limit)', async () => {
    // A real "too many requests" outcome: increment() resolves normally
    // (Redis is fine) but reports isBlocked — this must propagate as-is,
    // not fall through to the fallback path.
    const { guard } = await makeGuard(() =>
      Promise.resolve({
        totalHits: 999,
        timeToExpire: 10,
        isBlocked: true,
        timeToBlockExpire: 10,
      }),
    );
    const context = makeContext('203.0.113.12');

    await expect(
      (
        guard as unknown as {
          handleRequest: (props: ThrottlerRequest) => Promise<boolean>;
        }
      ).handleRequest(makeRequestProps(context)),
    ).rejects.toThrow(ThrottlerException);
  });

  it('falls through to the fallback limiter rather than rethrowing when storage genuinely errors', async () => {
    const { guard, logger } = await makeGuard(REDIS_DOWN);
    const context = makeContext('203.0.113.13');

    const allowed = await (
      guard as unknown as {
        handleRequest: (props: ThrottlerRequest) => Promise<boolean>;
      }
    ).handleRequest(makeRequestProps(context));

    expect(allowed).toBe(true);
    expect(logger.warnEvent).toHaveBeenCalledWith(
      'Throttler storage unavailable; using in-memory fallback limiter.',
      expect.objectContaining({ error: expect.stringContaining('ETIMEDOUT') }),
      'IpAwareThrottlerGuard',
    );
  });
});
