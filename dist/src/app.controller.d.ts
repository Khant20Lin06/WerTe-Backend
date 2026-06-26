import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    health(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
            cache: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
            queue: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
        };
    }>;
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
            cache: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
            queue: {
                status: "up" | "down";
                latencyMs?: number;
                error?: string;
            };
        };
    }>;
}
