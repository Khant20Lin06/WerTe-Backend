"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const configService = app.get(config_1.ConfigService);
    const prefix = configService.get('app.prefix') ?? 'api/v1';
    const environment = configService.get('app.environment') ?? 'development';
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Food Delivery API')
        .setDescription([
        'Backend API for the food delivery platform.',
        '',
        'Primary consumers:',
        '- Customer app',
        '- Rider app',
        '- Merchant app',
        '- Admin web',
        '',
        `Environment: ${environment}`,
    ].join('\n'))
        .setVersion('0.1.0')
        .addServer(`/${prefix}`, 'Primary API v1')
        .addTag('system', 'Health and operational readiness endpoints')
        .addTag('auth', 'Authentication and session lifecycle')
        .addTag('customer-orders', 'Customer order creation and history')
        .addTag('merchant-orders', 'Merchant order operations')
        .addTag('rider-orders', 'Rider-facing order and delivery views')
        .addTag('admin-orders', 'Administrative order monitoring and intervention')
        .addTag('messaging', 'Order-scoped messaging and conversation flows')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide a valid access token for protected endpoints.',
    }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        ignoreGlobalPrefix: true,
    });
    swagger_1.SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'Food Delivery API Docs',
        swaggerOptions: {
            displayOperationId: true,
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
}
//# sourceMappingURL=swagger.config.js.map