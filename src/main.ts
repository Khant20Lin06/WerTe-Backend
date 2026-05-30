import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp, logApplicationStartup } from './bootstrap/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const metadata = await configureApp(app);

  await app.listen(metadata.appPort, metadata.appHost);
  await logApplicationStartup(app, metadata);
}

bootstrap();
