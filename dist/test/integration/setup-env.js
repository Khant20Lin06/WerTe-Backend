"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envDefaults = {
    NODE_ENV: 'test',
    APP_NAME: 'food-delivery-backend-integration',
    APP_HOST: '127.0.0.1',
    APP_PORT: '3000',
    APP_PREFIX: 'api/v1',
    APP_CORS_ORIGINS: '',
    SWAGGER_ENABLED: 'false',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/food_delivery_integration',
    DB_ENABLE_QUERY_LOGS: 'false',
    REDIS_URL: 'redis://localhost:6379/1',
    REDIS_KEY_PREFIX: 'food-delivery-integration',
    JWT_ACCESS_SECRET: 'integration-access-secret-min-32-chars',
    JWT_REFRESH_SECRET: 'integration-refresh-secret-min-32-char',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '30d',
    JWT_ISSUER: 'food-delivery-backend',
    JWT_AUDIENCE: 'food-delivery-platform',
    S3_BUCKET: 'food-delivery-assets',
    S3_REGION: 'ap-southeast-1',
    FCM_PROJECT_ID: 'sample-project',
};
for (const [key, value] of Object.entries(envDefaults)) {
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
}
jest.setTimeout(30000);
//# sourceMappingURL=setup-env.js.map