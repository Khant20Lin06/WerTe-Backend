import { registerAs } from '@nestjs/config';

import { parseBoolean } from './config.utils';

const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL!,
  enableQueryLogs: parseBoolean(process.env.DB_ENABLE_QUERY_LOGS, false),
  // Prisma connection pool settings.
  // connection_limit: max open connections to PostgreSQL per process.
  //   Default (num_cpus * 2 + 1) is fine for dev but unpredictable in prod.
  //   20 is a safe starting point for a single app instance behind PgBouncer
  //   or a managed PostgreSQL (Aurora, Cloud SQL) that allows ~100 connections.
  //   Lower this if running many app replicas (total = limit × replicas).
  // pool_timeout: seconds to wait for a free connection before throwing.
  //   10s prevents cascading failures when the pool is temporarily saturated.
  connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 20),
  poolTimeout: Number(process.env.DATABASE_POOL_TIMEOUT_SECONDS ?? 10),
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;

export default databaseConfig;
