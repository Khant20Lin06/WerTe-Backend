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
exports.SessionCacheService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const actor_context_entity_1 = require("../../users/entities/actor-context.entity");
const SESSION_KEY_PREFIX = 'sess:';
let SessionCacheService = class SessionCacheService {
    constructor(redis) {
        this.redis = redis;
    }
    async get(sessionId) {
        const raw = await this.redis.get(this.key(sessionId));
        if (raw === null)
            return null;
        return JSON.parse(raw);
    }
    async set(sessionId, data, ttlSeconds) {
        if (ttlSeconds <= 0)
            return;
        await this.redis.set(this.key(sessionId), JSON.stringify(data), 'EX', ttlSeconds);
    }
    async invalidate(sessionId) {
        await this.redis.del(this.key(sessionId));
    }
    buildAuthenticatedUser(payload, cached) {
        return {
            userId: cached.user.id,
            sessionId: payload.sessionId,
            role: cached.user.role,
            tokenType: payload.type,
            actorContext: (0, actor_context_entity_1.buildActorContext)(cached.user),
        };
    }
    key(sessionId) {
        return `${SESSION_KEY_PREFIX}${sessionId}`;
    }
};
exports.SessionCacheService = SessionCacheService;
exports.SessionCacheService = SessionCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], SessionCacheService);
//# sourceMappingURL=session-cache.service.js.map