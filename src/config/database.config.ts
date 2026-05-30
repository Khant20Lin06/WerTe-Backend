import { registerAs } from '@nestjs/config';

import { parseBoolean } from './config.utils';

const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL!,
  enableQueryLogs: parseBoolean(process.env.DB_ENABLE_QUERY_LOGS, false),
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;

export default databaseConfig;
