import { RedisService } from '../../../src/infrastructure/redis/redis.service';

export function createRedisServiceMock(
  overrides?: Partial<RedisService>,
): jest.Mocked<RedisService> {
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    duplicate: jest.fn(),
    status: 'ready',
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    pttl: jest.fn().mockResolvedValue(-2),
    ...overrides,
  } as unknown as jest.Mocked<RedisService>;
}
