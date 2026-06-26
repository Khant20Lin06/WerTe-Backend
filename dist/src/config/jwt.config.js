"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    issuer: process.env.JWT_ISSUER ?? 'food-delivery-backend',
    audience: process.env.JWT_AUDIENCE ?? 'food-delivery-platform',
}));
exports.default = jwtConfig;
//# sourceMappingURL=jwt.config.js.map