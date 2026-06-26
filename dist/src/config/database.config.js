"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const config_utils_1 = require("./config.utils");
const databaseConfig = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    enableQueryLogs: (0, config_utils_1.parseBoolean)(process.env.DB_ENABLE_QUERY_LOGS, false),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 20),
    poolTimeout: Number(process.env.DATABASE_POOL_TIMEOUT_SECONDS ?? 10),
}));
exports.default = databaseConfig;
//# sourceMappingURL=database.config.js.map