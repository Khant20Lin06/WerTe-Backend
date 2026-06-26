import { PrismaService } from './infrastructure/database/prisma.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { QueueService } from './infrastructure/queue/queue.service';
type HealthStatus = 'up' | 'down';
type ComponentHealth = {
    status: HealthStatus;
    latencyMs?: number;
    error?: string;
};
export declare class AppService {
    private readonly prisma;
    private readonly redis;
    private readonly queueService;
    constructor(prisma: PrismaService, redis: RedisService, queueService: QueueService);
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: ComponentHealth;
            cache: ComponentHealth;
            queue: ComponentHealth;
        };
    }>;
    health(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: ComponentHealth;
            cache: ComponentHealth;
            queue: ComponentHealth;
        };
    }>;
    private checkDatabase;
    private checkRedis;
    private checkQueue;
}
export {};
