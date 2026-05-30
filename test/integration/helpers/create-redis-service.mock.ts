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
    ...overrides,
  } as unknown as jest.Mocked<RedisService>;
}
