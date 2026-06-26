"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMetricsService = void 0;
const common_1 = require("@nestjs/common");
const metrics_registry_1 = require("./metrics.registry");
let HttpMetricsService = class HttpMetricsService {
    constructor() {
        this.requestDuration = (0, metrics_registry_1.getOrCreateHistogram)({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
        });
        this.requestTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
        });
        this.requestErrorsTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'http_request_errors_total',
            help: 'Total number of HTTP requests that returned 4xx or 5xx',
            labelNames: ['method', 'route', 'status_code'],
        });
    }
};
exports.HttpMetricsService = HttpMetricsService;
exports.HttpMetricsService = HttpMetricsService = __decorate([
    (0, common_1.Injectable)()
], HttpMetricsService);
//# sourceMappingURL=http-metrics.service.js.map