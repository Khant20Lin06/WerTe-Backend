declare const jwtConfig: (() => {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
export default jwtConfig;
