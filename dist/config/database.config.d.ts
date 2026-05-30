declare const databaseConfig: (() => {
    url: string;
    enableQueryLogs: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    enableQueryLogs: boolean;
}>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export default databaseConfig;
