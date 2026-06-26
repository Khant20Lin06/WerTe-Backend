"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
exports.logApplicationStartup = logApplicationStartup;
const helmet_1 = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const bodyParser = require("body-parser");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const global_exception_filter_1 = require("../common/exceptions/global-exception.filter");
const logging_interceptor_1 = require("../common/interceptors/logging.interceptor");
const metrics_interceptor_1 = require("../common/interceptors/metrics.interceptor");
const timeout_interceptor_1 = require("../common/interceptors/timeout.interceptor");
const transform_interceptor_1 = require("../common/interceptors/transform.interceptor");
const request_context_middleware_1 = require("../common/middleware/request-context.middleware");
const swagger_config_1 = require("../config/swagger.config");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const http_metrics_service_1 = require("../infrastructure/metrics/http-metrics.service");
async function configureApp(app, options) {
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(app_logger_1.AppLogger);
    const httpMetrics = app.get(http_metrics_service_1.HttpMetricsService);
    const requestContextMiddleware = app.get(request_context_middleware_1.RequestContextMiddleware);
    const appHost = configService.getOrThrow('app.host');
    const appPort = configService.getOrThrow('app.port');
    const appPrefix = configService.getOrThrow('app.prefix');
    const corsOrigins = configService.get('app.corsOrigins') ?? [];
    const swaggerEnabled = configService.get('app.swaggerEnabled') ?? true;
    const environment = configService.get('app.environment') ?? 'development';
    const isProduction = environment === 'production';
    app.useLogger(logger);
    if (options?.enableShutdownHooks ?? true) {
        app.enableShutdownHooks();
    }
    if (isProduction) {
        app.getHttpAdapter().getInstance().set('trust proxy', 1);
    }
    app.use((request, response, next) => requestContextMiddleware.use(request, response, next));
    app.use((0, helmet_1.default)({
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
    }));
    app.use(cookieParser());
    app.use(compression());
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
    const DEV_CORS_ORIGINS = [
        /^https?:\/\/localhost(:\d+)?$/,
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ];
    const corsOriginPolicy = corsOrigins.length > 0
        ? corsOrigins
        : isProduction
            ? false
            : DEV_CORS_ORIGINS;
    app.enableCors({
        origin: corsOriginPolicy,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter(logger));
    app.useGlobalInterceptors(new metrics_interceptor_1.MetricsInterceptor(httpMetrics), new logging_interceptor_1.LoggingInterceptor(logger), new timeout_interceptor_1.TimeoutInterceptor(), new transform_interceptor_1.TransformInterceptor());
    app.setGlobalPrefix(appPrefix);
    const shouldEnableSwagger = swaggerEnabled && !isProduction;
    if (shouldEnableSwagger) {
        (0, swagger_config_1.setupSwagger)(app);
    }
    return {
        appHost,
        appPort,
        appPrefix,
    };
}
async function logApplicationStartup(app, metadata) {
    const logger = app.get(app_logger_1.AppLogger);
    logger.logEvent('Application listening.', {
        host: metadata.appHost,
        port: metadata.appPort,
        prefix: metadata.appPrefix,
        url: await app.getUrl(),
    }, 'Bootstrap');
}
//# sourceMappingURL=configure-app.js.map