import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

import { AppLogger } from '../logging/app.logger';

type TransactionOptions = {
  maxWaitMs?: number;
  timeoutMs?: number;
};

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly enableQueryLogs: boolean;

  constructor(
    configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    const enableQueryLogs =
      configService.get<boolean>('database.enableQueryLogs') ?? false;

    super({
      datasourceUrl: configService.getOrThrow<string>('database.url'),
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        ...(enableQueryLogs
          ? ([{ level: 'query', emit: 'event' }] as const)
          : []),
      ],
    });

    this.enableQueryLogs = enableQueryLogs;
    this.registerLogListeners();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.logEvent('Prisma connected.', undefined, 'Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.logEvent('Prisma disconnected.', undefined, 'Prisma');
  }

  async checkHealth() {
    const startedAt = Date.now();
    await this.$queryRaw`SELECT 1`;

    return {
      latencyMs: Date.now() - startedAt,
      status: 'up' as const,
    };
  }

  runInTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ) {
    return this.$transaction((tx) => operation(tx), {
      maxWait: options?.maxWaitMs ?? 5000,
      timeout: options?.timeoutMs ?? 10000,
    });
  }

  private registerLogListeners() {
    this.$on('warn', (event) => {
      this.logger.warnEvent(
        'Prisma warning emitted.',
        {
          message: event.message,
          target: event.target,
        },
        'Prisma',
      );
    });

    this.$on('error', (event) => {
      this.logger.errorEvent(
        'Prisma error emitted.',
        {
          message: event.message,
          target: event.target,
        },
        'Prisma',
      );
    });

    if (this.enableQueryLogs) {
      this.$on('query', (event) => {
        this.logger.debugEvent(
          'Prisma query executed.',
          {
            durationMs: event.duration,
            params: event.params,
            query: event.query,
            target: event.target,
          },
          'PrismaQuery',
        );
      });
    }
  }
}
