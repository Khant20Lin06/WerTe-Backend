import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

import { DatabaseConfig } from '../../config/database.config';

import { AppLogger } from '../logging/app.logger';
import { DbMetricsService } from '../metrics/db-metrics.service';

function buildPooledUrl(
  baseUrl: string,
  connectionLimit: number,
  poolTimeoutSeconds: number,
): string {
  const url = new URL(baseUrl);
  // Only set if not already present in the URL (env-provided values win).
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', String(connectionLimit));
  }
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', String(poolTimeoutSeconds));
  }
  return url.toString();
}

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
    private readonly dbMetrics: DbMetricsService,
  ) {
    const db = configService.get<DatabaseConfig>('database')!;

    // Append pool parameters as query-string args on the connection URL so
    // Prisma's built-in connection pool honours them without needing an
    // external pooler. These are ignored when an external pgBouncer URL is
    // used (pgBouncer strips unknown params), so the config is safe in both
    // setups.
    const url = buildPooledUrl(db.url, db.connectionLimit, db.poolTimeout);

    super({
      datasourceUrl: url,
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        ...(db.enableQueryLogs
          ? ([{ level: 'query', emit: 'event' }] as const)
          : []),
      ],
    });

    this.enableQueryLogs = db.enableQueryLogs;
    this.registerLogListeners();
    this.registerMetricsMiddleware();
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

  private registerMetricsMiddleware(): void {
    this.$use(async (params, next) => {
      const endTimer = this.dbMetrics.queryDuration.startTimer({
        model: params.model ?? 'unknown',
        action: params.action,
      });
      try {
        const result: unknown = await next(params);
        endTimer();
        return result;
      } catch (error) {
        endTimer();
        this.dbMetrics.queryErrorsTotal.inc({
          model: params.model ?? 'unknown',
          action: params.action,
        });
        throw error;
      }
    });
  }

  private registerLogListeners(): void {
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
