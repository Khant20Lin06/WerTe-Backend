import { PrismaService } from './infrastructure/database/prisma.service';
export declare class AppService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: {
                latencyMs: number;
                status: "up";
            };
        };
    }>;
    health(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: {
                latencyMs: number;
                status: "up";
            };
        };
    }>;
}
