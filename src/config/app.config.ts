import { registerAs } from '@nestjs/config';

import { NodeEnvironment, parseBoolean, parseCsv } from './config.utils';

const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'food-delivery-backend',
  environment: (process.env.NODE_ENV ?? 'development') as NodeEnvironment,
  host: process.env.APP_HOST ?? '0.0.0.0',
  port: Number(process.env.APP_PORT ?? 3000),
  prefix: process.env.APP_PREFIX ?? 'api/v1',
  corsOrigins: parseCsv(process.env.APP_CORS_ORIGINS),
  swaggerEnabled: parseBoolean(process.env.SWAGGER_ENABLED, true),
}));

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
