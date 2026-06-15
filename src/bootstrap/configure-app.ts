import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

import { GlobalExceptionFilter } from '../common/exceptions/global-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { RequestContextMiddleware } from '../common/middleware/request-context.middleware';
import { setupSwagger } from '../config/swagger.config';
import { AppLogger } from '../infrastructure/logging/app.logger';

export type ConfiguredAppMetadata = {
  appHost: string;
  appPort: number;
  appPrefix: string;
};

export async function configureApp(
  app: INestApplication,
  options?: {
    enableShutdownHooks?: boolean;
  },
): Promise<ConfiguredAppMetadata> {
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  const requestContextMiddleware = app.get(RequestContextMiddleware);

  const appHost = configService.getOrThrow<string>('app.host');
  const appPort = configService.getOrThrow<number>('app.port');
  const appPrefix = configService.getOrThrow<string>('app.prefix');
  const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? [];
  const swaggerEnabled = configService.get<boolean>('app.swaggerEnabled') ?? true;
  const environment = configService.get<string>('app.environment') ?? 'development';
  const isProduction = environment === 'production';

  app.useLogger(logger);
  if (options?.enableShutdownHooks ?? true) {
    app.enableShutdownHooks();
  }
  app.use((request: Request, response: Response, next: NextFunction) =>
    requestContextMiddleware.use(request, response, next),
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression());

  // In production, require explicit CORS origins — never reflect all origins.
  const corsOriginPolicy = corsOrigins.length > 0
    ? corsOrigins
    : isProduction
      ? false
      : true;

  app.enableCors({
    origin: corsOriginPolicy,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TimeoutInterceptor(),
    new TransformInterceptor(),
  );
  app.setGlobalPrefix(appPrefix);

  // Swagger is disabled in production unless explicitly enabled.
  const shouldEnableSwagger = swaggerEnabled && !isProduction;
  if (shouldEnableSwagger) {
    setupSwagger(app);
  }

  return {
    appHost,
    appPort,
    appPrefix,
  };
}

export async function logApplicationStartup(
  app: INestApplication,
  metadata: ConfiguredAppMetadata,
): Promise<void> {
  const logger = app.get(AppLogger);

  logger.logEvent(
    'Application listening.',
    {
      host: metadata.appHost,
      port: metadata.appPort,
      prefix: metadata.appPrefix,
      url: await app.getUrl(),
    },
    'Bootstrap',
  );
}
