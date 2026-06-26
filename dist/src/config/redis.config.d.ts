declare const redisConfig: (() => {
    url: string;
    keyPrefix: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    keyPrefix: string;
}>;
export type RedisConfig = ReturnType<typeof redisConfig>;
export default redisConfig;
