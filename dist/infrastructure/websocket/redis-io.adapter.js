"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = require("ioredis");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app, redisUrl) {
        super(app);
        this.redisUrl = redisUrl;
        this.adapterConstructor = null;
    }
    async connectToRedis() {
        const pubClient = new ioredis_1.Redis(this.redisUrl);
        const subClient = pubClient.duplicate();
        await Promise.all([
            new Promise((resolve, reject) => {
                pubClient.once('ready', resolve);
                pubClient.once('error', reject);
            }),
            new Promise((resolve, reject) => {
                subClient.once('ready', resolve);
                subClient.once('error', reject);
            }),
        ]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor !== null) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map