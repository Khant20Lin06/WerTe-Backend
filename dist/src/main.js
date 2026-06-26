"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const configure_app_1 = require("./bootstrap/configure-app");
const redis_io_adapter_1 = require("./infrastructure/websocket/redis-io.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    const redisUrl = configService.getOrThrow('redis.url');
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app, redisUrl);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    const metadata = await (0, configure_app_1.configureApp)(app);
    await app.listen(metadata.appPort, metadata.appHost);
    await (0, configure_app_1.logApplicationStartup)(app, metadata);
}
bootstrap();
//# sourceMappingURL=main.js.map