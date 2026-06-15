/**
 * Export the OpenAPI spec to JSON or YAML without starting the HTTP server.
 *
 * Usage:
 *   npm run docs:export             # defaults to JSON → openapi.json
 *   npm run docs:export:json        # explicit JSON
 *   npm run docs:export:yaml        # YAML → openapi.yaml
 */
import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function exportSpec() {
  const format = process.argv.includes('--format')
    ? process.argv[process.argv.indexOf('--format') + 1]
    : 'json';

  const outFile =
    format === 'yaml'
      ? path.resolve(process.cwd(), 'openapi.yaml')
      : path.resolve(process.cwd(), 'openapi.json');

  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription(
      [
        'Backend API for the food delivery platform.',
        '',
        'Primary consumers: Customer app · Rider app · Merchant app · Admin web',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addServer('/api/v1', 'Primary API v1')
    .addTag('system', 'Health and operational readiness endpoints')
    .addTag('auth', 'Authentication and session lifecycle')
    .addTag('customer-orders', 'Customer order creation and history')
    .addTag('merchant-orders', 'Merchant order operations')
    .addTag('rider-orders', 'Rider-facing order and delivery views')
    .addTag('admin-orders', 'Administrative order monitoring and intervention')
    .addTag('messaging', 'Order-scoped messaging and conversation flows')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide a valid access token for protected endpoints.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (format === 'yaml') {
    // Dynamic import so yaml dep is optional
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const yaml = require('js-yaml');
      fs.writeFileSync(outFile, yaml.dump(document, { lineWidth: 120 }), 'utf8');
    } catch {
      console.error('js-yaml not installed. Run: npm install --save-dev js-yaml');
      process.exit(1);
    }
  } else {
    fs.writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf8');
  }

  await app.close();
  console.log(`OpenAPI spec exported → ${outFile}`);
}

exportSpec().catch((err) => {
  console.error(err);
  process.exit(1);
});
