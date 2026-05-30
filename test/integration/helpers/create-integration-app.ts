import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../../src/app.module';
import { configureApp } from '../../../src/bootstrap/configure-app';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { RedisService } from '../../../src/infrastructure/redis/redis.service';
import { createAppLoggerMock } from './create-app-logger.mock';
import { createPrismaServiceMock } from './create-prisma-service.mock';
import { createRedisServiceMock } from './create-redis-service.mock';
import { IntegrationTestClient } from './integration-test-client';

type IntegrationProviderOverride = {
  provide: unknown;
  useValue: unknown;
};

export async function createIntegrationApp(options?: {
  prisma?: jest.Mocked<PrismaService>;
  redis?: jest.Mocked<RedisService>;
  overrides?: IntegrationProviderOverride[];
}) {
  const prisma = options?.prisma ?? createPrismaServiceMock();
  const redis = options?.redis ?? createRedisServiceMock();
  const logger = createAppLoggerMock();
  const builder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue(redis)
    .overrideProvider(AppLogger)
    .useValue(logger);

  for (const override of options?.overrides ?? []) {
    builder.overrideProvider(override.provide).useValue(override.useValue);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await configureApp(app, {
    enableShutdownHooks: false,
  });
  await app.listen(0, '127.0.0.1');

  return {
    app,
    prisma,
    redis,
    logger,
    client: new IntegrationTestClient(await app.getUrl()),
    async close() {
      await closeIntegrationApp(app);
    },
  };
}

async function closeIntegrationApp(app: INestApplication): Promise<void> {
  await app.close();
}
