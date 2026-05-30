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
exports.CustomerCheckoutController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const checkout_preview_dto_1 = require("../dto/checkout-preview.dto");
const preview_checkout_dto_1 = require("../dto/preview-checkout.dto");
const checkout_preview_service_1 = require("../services/checkout-preview.service");
let CustomerCheckoutController = class CustomerCheckoutController {
    constructor(checkoutPreviewService) {
        this.checkoutPreviewService = checkoutPreviewService;
    }
    async preview(currentUser, body) {
        const preview = await this.checkoutPreviewService.previewCurrentCustomerCheckout(currentUser, {
            branchId: body.branchId,
            addressId: body.addressId,
        });
        return (0, checkout_preview_dto_1.toCheckoutPreviewDto)(preview);
    }
};
exports.CustomerCheckoutController = CustomerCheckoutController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'previewCurrentCustomerCheckout',
        summary: 'Preview the validated checkout for the authenticated customer',
    }),
    (0, swagger_1.ApiBody)({ type: preview_checkout_dto_1.PreviewCheckoutDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the validated checkout preview including customer, address, cart, branch, and pricing context.',
        type: checkout_preview_dto_1.CheckoutPreviewDto,
    }),
    (0, common_1.Post)('preview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        preview_checkout_dto_1.PreviewCheckoutDto]),
    __metadata("design:returntype", Promise)
], CustomerCheckoutController.prototype, "preview", null);
exports.CustomerCheckoutController = CustomerCheckoutController = __decorate([
    (0, swagger_1.ApiTags)('customer-checkout'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/checkout'),
    __metadata("design:paramtypes", [checkout_preview_service_1.CheckoutPreviewService])
], CustomerCheckoutController);
//# sourceMappingURL=customer-checkout.controller.js.map