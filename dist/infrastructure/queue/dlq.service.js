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
exports.DlqService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const app_logger_1 = require("../logging/app.logger");
const DLQ_TTL_SECONDS = 60 * 60 * 24 * 30;
const DLQ_KEY_PREFIX = 'dlq';
let DlqService = class DlqService {
    constructor(configService, logger) {
        this.logger = logger;
        this.connection = new ioredis_1.default(configService.getOrThrow('redis.url'), {
            keyPrefix: '',
            maxRetriesPerRequest: null,
        });
    }
    onModuleInit() {
    }
    async push(entry) {
        const key = this.toKey(entry.queueName, entry.jobName);
        const score = new Date(entry.failedAt).getTime();
        const value = JSON.stringify(entry);
        await this.connection.zadd(key, score, value);
        await this.connection.expire(key, DLQ_TTL_SECONDS);
        this.logger.errorEvent('Job moved to dead-letter queue.', {
            id: entry.id,
            queueName: entry.queueName,
            jobName: entry.jobName,
            attempts: entry.attempts,
            lastError: entry.lastError,
        }, 'DlqService');
    }
    async list(queueName, jobName) {
        if (queueName !== undefined && jobName !== undefined) {
            return this.listFromKey(this.toKey(queueName, jobName));
        }
        const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
        if (keys.length === 0)
            return [];
        const entries = await Promise.all(keys.map((key) => this.listFromKey(key)));
        return entries.flat().sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime());
    }
    async remove(queueName, jobName, jobId) {
        const key = this.toKey(queueName, jobName);
        const members = await this.connection.zrange(key, 0, -1);
        for (const member of members) {
            const entry = this.parseEntry(member);
            if (entry?.id === jobId) {
                await this.connection.zrem(key, member);
                return true;
            }
        }
        return false;
    }
    async pruneExpired() {
        const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
        if (keys.length === 0)
            return 0;
        const cutoff = Date.now() - DLQ_TTL_SECONDS * 1000;
        let total = 0;
        for (const key of keys) {
            const removed = await this.connection.zremrangebyscore(key, '-inf', cutoff);
            total += removed;
        }
        return total;
    }
    async count(queueName, jobName) {
        if (queueName !== undefined && jobName !== undefined) {
            return this.connection.zcard(this.toKey(queueName, jobName));
        }
        const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
        if (keys.length === 0)
            return 0;
        const counts = await Promise.all(keys.map((k) => this.connection.zcard(k)));
        return counts.reduce((sum, c) => sum + c, 0);
    }
    async listFromKey(key) {
        const members = await this.connection.zrevrange(key, 0, -1);
        return members.flatMap((m) => {
            const entry = this.parseEntry(m);
            return entry !== null ? [entry] : [];
        });
    }
    async scanKeys(pattern) {
        const keys = [];
        let cursor = '0';
        do {
            const [nextCursor, batch] = await this.connection.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            keys.push(...batch);
        } while (cursor !== '0');
        return keys;
    }
    parseEntry(raw) {
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    toKey(queueName, jobName) {
        return `${DLQ_KEY_PREFIX}:${queueName}:${jobName}`;
    }
};
exports.DlqService = DlqService;
exports.DlqService = DlqService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_logger_1.AppLogger])
], DlqService);
//# sourceMappingURL=dlq.service.js.map