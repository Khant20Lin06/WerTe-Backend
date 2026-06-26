import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

import { GlobalExceptionFilter } from '../common/exceptions/global-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { MetricsInterceptor } from '../common/interceptors/metrics.interceptor';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { RequestContextMiddleware } from '../common/middleware/request-context.middleware';
import { setupSwagger } from '../config/swagger.config';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { HttpMetricsService } from '../infrastructure/metrics/http-metrics.service';

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
  const httpMetrics = app.get(HttpMetricsService);
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

  // Tell Express to trust the leftmost IP in X-Forwarded-For when running
  // behind a single reverse-proxy layer (nginx, ALB, Cloud Run, etc.).
  // Without this req.ip returns 127.0.0.1 (the proxy), breaking IP-based
  // throttling and geo-detection. Value "1" means trust one hop.
  if (isProduction) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.use((request: Request, response: Response, next: NextFunction) =>
    requestContextMiddleware.use(request, response, next),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );
  app.use(cookieParser());
  app.use(compression());
  // Explicit body size limits — Express default (100kb) is too low for some
  // payloads (e.g. large JSON cart submissions) but unbounded is dangerous.
  // Multipart/file uploads go through Multer which enforces its own limit.
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

  // Never reflect arbitrary origins — even in development `credentials: true`
  // means the browser will send cookies/auth headers to whatever origin we echo
  // back, which makes wildcard reflection equivalent to disabling CORS entirely.
  //
  // Resolution order:
  //   1. APP_CORS_ORIGINS env var (comma-separated) — always wins
  //   2. Production with no env var → block all cross-origin requests
  //   3. Dev/staging with no env var → allow localhost on common dev ports only
  const DEV_CORS_ORIGINS = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  const corsOriginPolicy: boolean | string[] | RegExp[] =
    corsOrigins.length > 0
      ? corsOrigins
      : isProduction
        ? false
        : DEV_CORS_ORIGINS;

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
    new MetricsInterceptor(httpMetrics),
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
