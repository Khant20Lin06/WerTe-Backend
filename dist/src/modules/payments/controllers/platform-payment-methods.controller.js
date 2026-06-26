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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformPaymentMethodsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const platform_payment_methods_repository_1 = require("../repositories/platform-payment-methods.repository");
class UpsertPaymentMethodDto {
}
let PlatformPaymentMethodsController = class PlatformPaymentMethodsController {
    constructor(repo) {
        this.repo = repo;
    }
    async listEnabled() {
        const methods = await this.repo.findEnabled();
        return methods.map(m => ({
            method: m.method,
            displayName: m.displayName,
            description: m.description,
            sortOrder: m.sortOrder,
            bankDetails: m.bankDetails,
        }));
    }
    async listAll() {
        return this.repo.findAll();
    }
    async upsert(body) {
        return this.repo.upsert(body.method, {
            displayName: body.displayName,
            description: body.description,
            isEnabled: body.isEnabled,
            sortOrder: body.sortOrder,
            bankDetails: body.bankDetails,
        });
    }
};
exports.PlatformPaymentMethodsController = PlatformPaymentMethodsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List enabled payment methods' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformPaymentMethodsController.prototype, "listEnabled", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: list all payment methods' }),
    (0, common_1.Get)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformPaymentMethodsController.prototype, "listAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: update payment method config' }),
    (0, common_1.Put)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpsertPaymentMethodDto]),
    __metadata("design:returntype", Promise)
], PlatformPaymentMethodsController.prototype, "upsert", null);
exports.PlatformPaymentMethodsController = PlatformPaymentMethodsController = __decorate([
    (0, swagger_1.ApiTags)('payment-methods'),
    (0, common_1.Controller)('payment-methods'),
    __metadata("design:paramtypes", [platform_payment_methods_repository_1.PlatformPaymentMethodsRepository])
], PlatformPaymentMethodsController);
//# sourceMappingURL=platform-payment-methods.controller.js.map