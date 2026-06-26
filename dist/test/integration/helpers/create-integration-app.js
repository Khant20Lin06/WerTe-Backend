"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntegrationApp = createIntegrationApp;
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../../src/app.module");
const configure_app_1 = require("../../../src/bootstrap/configure-app");
const prisma_service_1 = require("../../../src/infrastructure/database/prisma.service");
const app_logger_1 = require("../../../src/infrastructure/logging/app.logger");
const redis_service_1 = require("../../../src/infrastructure/redis/redis.service");
const create_app_logger_mock_1 = require("./create-app-logger.mock");
const create_prisma_service_mock_1 = require("./create-prisma-service.mock");
const create_redis_service_mock_1 = require("./create-redis-service.mock");
const integration_test_client_1 = require("./integration-test-client");
async function createIntegrationApp(options) {
    const prisma = options?.prisma ?? (0, create_prisma_service_mock_1.createPrismaServiceMock)();
    const redis = options?.redis ?? (0, create_redis_service_mock_1.createRedisServiceMock)();
    const logger = (0, create_app_logger_mock_1.createAppLoggerMock)();
    const builder = testing_1.Test.createTestingModule({
        imports: [app_module_1.AppModule],
    })
        .overrideProvider(prisma_service_1.PrismaService)
        .useValue(prisma)
        .overrideProvider(redis_service_1.RedisService)
        .useValue(redis)
        .overrideProvider(app_logger_1.AppLogger)
        .useValue(logger);
    for (const override of options?.overrides ?? []) {
        builder.overrideProvider(override.provide).useValue(override.useValue);
    }
    const moduleRef = await builder.compile();
    const app = moduleRef.createNestApplication();
    await (0, configure_app_1.configureApp)(app, {
        enableShutdownHooks: false,
    });
    await app.listen(0, '127.0.0.1');
    return {
        app,
        prisma,
        redis,
        logger,
        client: new integration_test_client_1.IntegrationTestClient(await app.getUrl()),
        async close() {
            await closeIntegrationApp(app);
        },
    };
}
async function closeIntegrationApp(app) {
    await app.close();
}
//# sourceMappingURL=create-integration-app.js.map