import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/app.logger';
export declare class FcmService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private app;
    private readonly isConfigured;
    constructor(configService: ConfigService, logger: AppLogger);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    send(payload: {
        notificationId: string;
        userId: string;
        title: string;
        body: string;
        navigationPath: string | null;
        deviceTokens: string[];
    }): Promise<{
        providerMessageId: string | null;
        deliveredDeviceTokens: string[];
        invalidDeviceTokens: string[];
    }>;
    private sendReal;
    private sendStub;
}
