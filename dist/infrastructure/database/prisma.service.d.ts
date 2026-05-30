import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { AppLogger } from '../logging/app.logger';
type TransactionOptions = {
    maxWaitMs?: number;
    timeoutMs?: number;
};
export declare class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'> implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly enableQueryLogs;
    constructor(configService: ConfigService, logger: AppLogger);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    checkHealth(): Promise<{
        latencyMs: number;
        status: "up";
    }>;
    runInTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>, options?: TransactionOptions): Promise<T>;
    private registerLogListeners;
}
export {};
