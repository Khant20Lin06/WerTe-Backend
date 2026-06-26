"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./infrastructure/database/prisma.service");
const redis_service_1 = require("./infrastructure/redis/redis.service");
const queue_service_1 = require("./infrastructure/queue/queue.service");
let AppService = class AppService {
    constructor(prisma, redis, queueService) {
        this.prisma = prisma;
        this.redis = redis;
        this.queueService = queueService;
    }
    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async ready() {
        const [database, cache, queue] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkQueue(),
        ]);
        const allUp = database.status === 'up' && cache.status === 'up' && queue.status === 'up';
        return {
            status: allUp ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            checks: { database, cache, queue },
        };
    }
    async health() {
        return this.ready();
    }
    async checkDatabase() {
        try {
            return await this.prisma.checkHealth();
        }
        catch (error) {
            return { status: 'down', error: String(error) };
        }
    }
    async checkRedis() {
        const startedAt = Date.now();
        try {
            const pong = await this.redis.ping();
            if (pong !== 'PONG') {
                return { status: 'down', error: `Unexpected PING response: ${pong}` };
            }
            return { status: 'up', latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return { status: 'down', error: String(error) };
        }
    }
    checkQueue() {
        const handlers = this.queueService.listRegisteredHandlers();
        if (handlers.length === 0) {
            return { status: 'down', error: 'No BullMQ handlers registered' };
        }
        return { status: 'up' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        queue_service_1.QueueService])
], AppService);
//# sourceMappingURL=app.service.js.map