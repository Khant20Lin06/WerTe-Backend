"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = require("cookie-parser");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/exceptions/global-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const request_context_middleware_1 = require("./common/middleware/request-context.middleware");
const swagger_config_1 = require("./config/swagger.config");
const app_logger_1 = require("./infrastructure/logging/app.logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(app_logger_1.AppLogger);
    const requestContextMiddleware = app.get(request_context_middleware_1.RequestContextMiddleware);
    const appHost = configService.getOrThrow('app.host');
    const appPort = configService.getOrThrow('app.port');
    const appPrefix = configService.getOrThrow('app.prefix');
    const corsOrigins = configService.get('app.corsOrigins') ?? [];
    const swaggerEnabled = configService.get('app.swaggerEnabled') ?? true;
    app.useLogger(logger);
    app.enableShutdownHooks();
    app.use((request, response, next) => requestContextMiddleware.use(request, response, next));
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: corsOrigins.length > 0 ? corsOrigins : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter(logger));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(logger), new timeout_interceptor_1.TimeoutInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.setGlobalPrefix(appPrefix);
    if (swaggerEnabled) {
        (0, swagger_config_1.setupSwagger)(app);
    }
    await app.listen(appPort, appHost);
    logger.logEvent('Application listening.', {
        host: appHost,
        port: appPort,
        prefix: appPrefix,
        url: await app.getUrl(),
    }, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map