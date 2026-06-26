"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const config_utils_1 = require("./config.utils");
const appConfig = (0, config_1.registerAs)('app', () => ({
    name: process.env.APP_NAME ?? 'food-delivery-backend',
    environment: (process.env.NODE_ENV ?? 'development'),
    host: process.env.APP_HOST ?? '0.0.0.0',
    port: Number(process.env.APP_PORT ?? 3000),
    prefix: process.env.APP_PREFIX ?? 'api/v1',
    corsOrigins: (0, config_utils_1.parseCsv)(process.env.APP_CORS_ORIGINS),
    swaggerEnabled: (0, config_utils_1.parseBoolean)(process.env.SWAGGER_ENABLED, true),
}));
exports.default = appConfig;
//# sourceMappingURL=app.config.js.map