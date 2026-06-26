import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/app.logger';
export interface UploadResult {
    key: string;
    url: string;
}
export declare class S3Service implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private client;
    private bucket;
    private publicBaseUrl;
    private readonly isConfigured;
    constructor(configService: ConfigService, logger: AppLogger);
    onModuleInit(): void;
    upload(key: string, data: Buffer, options?: {
        contentType?: string;
        acl?: 'private' | 'public-read';
    }): Promise<UploadResult>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    buildUrl(key: string): string;
    private uploadStub;
}
