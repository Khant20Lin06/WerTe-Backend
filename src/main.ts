import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { configureApp, logApplicationStartup } from './bootstrap/configure-app';
import { RedisIoAdapter } from './infrastructure/websocket/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Wire Redis-backed Socket.io adapter before configureApp so the adapter
  // is in place when NestJS initialises WebSocket gateways. This ensures
  // events emitted on any app instance reach clients connected to any other
  // instance (required for horizontal scaling).
  const configService = app.get(ConfigService);
  const redisUrl = configService.getOrThrow<string>('redis.url');
  const redisIoAdapter = new RedisIoAdapter(app, redisUrl);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const metadata = await configureApp(app);

  await app.listen(metadata.appPort, metadata.appHost);
  await logApplicationStartup(app, metadata);
}

bootstrap();
