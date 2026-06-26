import { NodeEnvironment } from './config.utils';
declare const appConfig: (() => {
    name: string;
    environment: NodeEnvironment;
    host: string;
    port: number;
    prefix: string;
    corsOrigins: string[];
    swaggerEnabled: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    name: string;
    environment: NodeEnvironment;
    host: string;
    port: number;
    prefix: string;
    corsOrigins: string[];
    swaggerEnabled: boolean;
}>;
export type AppConfig = ReturnType<typeof appConfig>;
export default appConfig;
