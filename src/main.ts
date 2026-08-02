import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { AppLogger } from './infrastructure/logging/app.logger';
import { configureApp, logApplicationStartup } from './bootstrap/configure-app';
import { RedisIoAdapter } from './infrastructure/websocket/redis-io.adapter';

const REDIS_IO_ADAPTER_TIMEOUT_MS = 5_000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Wire Redis-backed Socket.io adapter before configureApp so the adapter
  // is in place when NestJS initialises WebSocket gateways. This ensures
  // events emitted on any app instance reach clients connected to any other
  // instance (required for horizontal scaling).
  //
  // Bounded and non-fatal: connectToRedis() waits on ioredis 'ready', which
  // never fires if Redis is unreachable at boot — verified live, this
  // blocked the entire app from ever finishing startup (HTTP never started
  // serving) with Redis down. Cross-instance WebSocket broadcast degrading
  // to single-instance-only is an acceptable trade-off next to the app
  // being unable to boot at all.
  const configService = app.get(ConfigService);
  const redisUrl = configService.getOrThrow<string>('redis.url');
  const logger = app.get(AppLogger);
  try {
    const redisIoAdapter = new RedisIoAdapter(app, redisUrl);
    await withTimeout(
      redisIoAdapter.connectToRedis(),
      REDIS_IO_ADAPTER_TIMEOUT_MS,
    );
    app.useWebSocketAdapter(redisIoAdapter);
  } catch (error) {
    logger.warnEvent(
      'Redis WebSocket adapter failed to connect at startup; continuing without cross-instance broadcast.',
      { error: String(error) },
      'Bootstrap',
    );
  }

  const metadata = await configureApp(app);

  await app.listen(metadata.appPort, metadata.appHost);
  await logApplicationStartup(app, metadata);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

bootstrap();
