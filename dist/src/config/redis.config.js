"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const redisConfig = (0, config_1.registerAs)('redis', () => ({
    url: process.env.REDIS_URL,
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'food-delivery',
}));
exports.default = redisConfig;
//# sourceMappingURL=redis.config.js.map