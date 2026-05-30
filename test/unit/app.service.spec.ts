import { AppService } from '../../src/app.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

describe('AppService', () => {
  it('returns a live status payload', () => {
    const prisma = {
      checkHealth: jest.fn(),
    } as unknown as PrismaService;
    const service = new AppService(prisma);

    const result = service.live();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toEqual(expect.any(String));
  });

  it('returns readiness payload with database status', async () => {
    const prisma = {
      checkHealth: jest.fn().mockResolvedValue({
        latencyMs: 12,
        status: 'up',
      }),
    } as unknown as PrismaService;
    const service = new AppService(prisma);

    const result = await service.ready();

    expect(prisma.checkHealth).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      checks: {
        database: {
          latencyMs: 12,
          status: 'up',
        },
      },
    });
  });
});
