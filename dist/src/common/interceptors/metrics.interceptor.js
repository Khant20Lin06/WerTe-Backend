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
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const http_metrics_service_1 = require("../../infrastructure/metrics/http-metrics.service");
let MetricsInterceptor = class MetricsInterceptor {
    constructor(httpMetrics) {
        this.httpMetrics = httpMetrics;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const endTimer = this.httpMetrics.requestDuration.startTimer();
        return next.handle().pipe((0, rxjs_1.finalize)(() => {
            const route = request.route?.path ?? request.url ?? 'unknown';
            const labels = {
                method: request.method,
                route,
                status_code: String(response.statusCode),
            };
            endTimer(labels);
            this.httpMetrics.requestTotal.inc(labels);
            if (response.statusCode >= 400) {
                this.httpMetrics.requestErrorsTotal.inc(labels);
            }
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [http_metrics_service_1.HttpMetricsService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map