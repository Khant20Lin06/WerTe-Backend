"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMetricsService = void 0;
const common_1 = require("@nestjs/common");
const metrics_registry_1 = require("./metrics.registry");
let CacheMetricsService = class CacheMetricsService {
    constructor() {
        this.cacheHitsTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'cache_hits_total',
            help: 'Total number of cache hits',
            labelNames: ['cache'],
        });
        this.cacheMissesTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'cache_misses_total',
            help: 'Total number of cache misses',
            labelNames: ['cache'],
        });
    }
    hit(cache) {
        this.cacheHitsTotal.inc({ cache });
    }
    miss(cache) {
        this.cacheMissesTotal.inc({ cache });
    }
};
exports.CacheMetricsService = CacheMetricsService;
exports.CacheMetricsService = CacheMetricsService = __decorate([
    (0, common_1.Injectable)()
], CacheMetricsService);
//# sourceMappingURL=cache-metrics.service.js.map