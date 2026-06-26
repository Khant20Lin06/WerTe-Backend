import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/app.logger';
export type DlqEntry = {
    id: string;
    queueName: string;
    jobName: string;
    payload: unknown;
    failedAt: string;
    lastError: string;
    attempts: number;
    createdAt: string;
};
export declare class DlqService implements OnModuleInit {
    private readonly logger;
    private readonly connection;
    constructor(configService: ConfigService, logger: AppLogger);
    onModuleInit(): void;
    push(entry: DlqEntry): Promise<void>;
    list(queueName?: string, jobName?: string): Promise<DlqEntry[]>;
    remove(queueName: string, jobName: string, jobId: string): Promise<boolean>;
    pruneExpired(): Promise<number>;
    count(queueName?: string, jobName?: string): Promise<number>;
    private listFromKey;
    private scanKeys;
    private parseEntry;
    private toKey;
}
