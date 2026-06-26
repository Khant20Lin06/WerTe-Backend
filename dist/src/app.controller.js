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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("./common/decorators/public.decorator");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async health() {
        return this.appService.health();
    }
    live() {
        return this.appService.live();
    }
    async ready() {
        return this.appService.ready();
    }
};
exports.AppController = AppController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getPlatformHealth',
        summary: 'Get overall platform health',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns aggregated application health and readiness status.',
    }),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "health", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getPlatformLiveness',
        summary: 'Get liveness status',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns simple process liveness status.',
    }),
    (0, common_1.Get)('health/live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "live", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getPlatformReadiness',
        summary: 'Get readiness status',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns readiness checks including database connectivity.',
    }),
    (0, common_1.Get)('health/ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "ready", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('system'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map