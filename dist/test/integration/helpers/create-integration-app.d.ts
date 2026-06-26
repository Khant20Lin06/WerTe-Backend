import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { RedisService } from '../../../src/infrastructure/redis/redis.service';
import { IntegrationTestClient } from './integration-test-client';
type IntegrationProviderOverride = {
    provide: unknown;
    useValue: unknown;
};
export declare function createIntegrationApp(options?: {
    prisma?: jest.Mocked<PrismaService>;
    redis?: jest.Mocked<RedisService>;
    overrides?: IntegrationProviderOverride[];
}): Promise<{
    app: INestApplication<any>;
    prisma: jest.Mocked<PrismaService>;
    redis: jest.Mocked<RedisService>;
    logger: jest.Mocked<AppLogger>;
    client: IntegrationTestClient;
    close(): Promise<void>;
}>;
export {};
