declare const databaseConfig: (() => {
    url: string;
    enableQueryLogs: boolean;
    connectionLimit: number;
    poolTimeout: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    enableQueryLogs: boolean;
    connectionLimit: number;
    poolTimeout: number;
}>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export default databaseConfig;
