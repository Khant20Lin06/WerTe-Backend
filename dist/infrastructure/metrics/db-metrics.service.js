"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMetricsService = void 0;
const common_1 = require("@nestjs/common");
const metrics_registry_1 = require("./metrics.registry");
let DbMetricsService = class DbMetricsService {
    constructor() {
        this.queryDuration = (0, metrics_registry_1.getOrCreateHistogram)({
            name: 'db_query_duration_seconds',
            help: 'Prisma database query duration in seconds',
            labelNames: ['model', 'action'],
            buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
        });
        this.queryErrorsTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'db_query_errors_total',
            help: 'Total number of Prisma query errors',
            labelNames: ['model', 'action'],
        });
    }
};
exports.DbMetricsService = DbMetricsService;
exports.DbMetricsService = DbMetricsService = __decorate([
    (0, common_1.Injectable)()
], DbMetricsService);
//# sourceMappingURL=db-metrics.service.js.map