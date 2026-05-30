import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
}
