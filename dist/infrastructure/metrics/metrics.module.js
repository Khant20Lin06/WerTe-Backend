"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("./cache-metrics.service");
const db_metrics_service_1 = require("./db-metrics.service");
const http_metrics_service_1 = require("./http-metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const queue_metrics_service_1 = require("./queue-metrics.service");
const trace_service_1 = require("./trace.service");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [metrics_controller_1.MetricsController],
        providers: [
            http_metrics_service_1.HttpMetricsService,
            db_metrics_service_1.DbMetricsService,
            cache_metrics_service_1.CacheMetricsService,
            queue_metrics_service_1.QueueMetricsService,
            trace_service_1.TraceService,
        ],
        exports: [
            http_metrics_service_1.HttpMetricsService,
            db_metrics_service_1.DbMetricsService,
            cache_metrics_service_1.CacheMetricsService,
            queue_metrics_service_1.QueueMetricsService,
            trace_service_1.TraceService,
        ],
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map