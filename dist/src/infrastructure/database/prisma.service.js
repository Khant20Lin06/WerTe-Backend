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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const app_logger_1 = require("../logging/app.logger");
const db_metrics_service_1 = require("../metrics/db-metrics.service");
function buildPooledUrl(baseUrl, connectionLimit, poolTimeoutSeconds) {
    const url = new URL(baseUrl);
    if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', String(connectionLimit));
    }
    if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', String(poolTimeoutSeconds));
    }
    return url.toString();
}
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(configService, logger, dbMetrics) {
        const db = configService.get('database');
        const url = buildPooledUrl(db.url, db.connectionLimit, db.poolTimeout);
        super({
            datasourceUrl: url,
            log: [
                { level: 'warn', emit: 'event' },
                { level: 'error', emit: 'event' },
                ...(db.enableQueryLogs
                    ? [{ level: 'query', emit: 'event' }]
                    : []),
            ],
        });
        this.logger = logger;
        this.dbMetrics = dbMetrics;
        this.enableQueryLogs = db.enableQueryLogs;
        this.registerLogListeners();
        this.registerMetricsMiddleware();
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.logEvent('Prisma connected.', undefined, 'Prisma');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.logEvent('Prisma disconnected.', undefined, 'Prisma');
    }
    async checkHealth() {
        const startedAt = Date.now();
        await this.$queryRaw `SELECT 1`;
        return {
            latencyMs: Date.now() - startedAt,
            status: 'up',
        };
    }
    runInTransaction(operation, options) {
        return this.$transaction((tx) => operation(tx), {
            maxWait: options?.maxWaitMs ?? 5000,
            timeout: options?.timeoutMs ?? 10000,
        });
    }
    registerMetricsMiddleware() {
        this.$use(async (params, next) => {
            const endTimer = this.dbMetrics.queryDuration.startTimer({
                model: params.model ?? 'unknown',
                action: params.action,
            });
            try {
                const result = await next(params);
                endTimer();
                return result;
            }
            catch (error) {
                endTimer();
                this.dbMetrics.queryErrorsTotal.inc({
                    model: params.model ?? 'unknown',
                    action: params.action,
                });
                throw error;
            }
        });
    }
    registerLogListeners() {
        this.$on('warn', (event) => {
            this.logger.warnEvent('Prisma warning emitted.', {
                message: event.message,
                target: event.target,
            }, 'Prisma');
        });
        this.$on('error', (event) => {
            this.logger.errorEvent('Prisma error emitted.', {
                message: event.message,
                target: event.target,
            }, 'Prisma');
        });
        if (this.enableQueryLogs) {
            this.$on('query', (event) => {
                this.logger.debugEvent('Prisma query executed.', {
                    durationMs: event.duration,
                    params: event.params,
                    query: event.query,
                    target: event.target,
                }, 'PrismaQuery');
            });
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_logger_1.AppLogger,
        db_metrics_service_1.DbMetricsService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map