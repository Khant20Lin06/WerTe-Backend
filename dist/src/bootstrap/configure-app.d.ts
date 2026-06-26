import { INestApplication } from '@nestjs/common';
export type ConfiguredAppMetadata = {
    appHost: string;
    appPort: number;
    appPrefix: string;
};
export declare function configureApp(app: INestApplication, options?: {
    enableShutdownHooks?: boolean;
}): Promise<ConfiguredAppMetadata>;
export declare function logApplicationStartup(app: INestApplication, metadata: ConfiguredAppMetadata): Promise<void>;
