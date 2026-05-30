import { PrismaService } from '../../../src/infrastructure/database/prisma.service';

type MockRecord = Record<string | symbol, unknown>;

function createDelegateMock(): MockRecord {
  const target: MockRecord = {};

  return new Proxy(target, {
    get(currentTarget, property: string | symbol) {
      if (!(property in currentTarget)) {
        currentTarget[property] = jest.fn();
      }

      return currentTarget[property];
    },
  });
}

export function createPrismaServiceMock(
  overrides?: Partial<PrismaService>,
): jest.Mocked<PrismaService> {
  const delegates = new Map<string | symbol, MockRecord>();
  const base = {
    checkHealth: jest.fn().mockResolvedValue({
      latencyMs: 1,
      status: 'up',
    }),
    runInTransaction: jest.fn(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(createDelegateMock()),
    ),
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]),
    ...overrides,
  } as MockRecord;

  return new Proxy(base, {
    get(target, property: string | symbol) {
      if (property in target) {
        return target[property];
      }

      if (!delegates.has(property)) {
        delegates.set(property, createDelegateMock());
      }

      return delegates.get(property);
    },
  }) as unknown as jest.Mocked<PrismaService>;
}
