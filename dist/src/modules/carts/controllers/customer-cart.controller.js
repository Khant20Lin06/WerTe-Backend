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
exports.CustomerCartController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const add_cart_item_dto_1 = require("../dto/add-cart-item.dto");
const cart_dto_1 = require("../dto/cart.dto");
const get_cart_query_dto_1 = require("../dto/get-cart-query.dto");
const update_cart_item_dto_1 = require("../dto/update-cart-item.dto");
const customer_cart_service_1 = require("../services/customer-cart.service");
let CustomerCartController = class CustomerCartController {
    constructor(customerCartService) {
        this.customerCartService = customerCartService;
    }
    getCurrentCart(currentUser, query) {
        return this.customerCartService.getCurrentCustomerCart(currentUser, query.branchId);
    }
    addItem(currentUser, body) {
        return this.customerCartService.addCurrentCustomerCartItem(currentUser, body);
    }
    updateItem(currentUser, cartItemId, body) {
        return this.customerCartService.updateCurrentCustomerCartItem(currentUser, cartItemId, body);
    }
    removeItem(currentUser, cartItemId) {
        return this.customerCartService.removeCurrentCustomerCartItem(currentUser, cartItemId);
    }
    clearCart(currentUser, query) {
        return this.customerCartService.clearCurrentCustomerCart(currentUser, query.branchId);
    }
};
exports.CustomerCartController = CustomerCartController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentCustomerCart',
        summary: 'Return the active cart for the authenticated customer and branch',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'branchId',
        description: 'Branch identifier used to scope the active cart lookup.',
        type: String,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the active cart aggregate for the requested branch, or an empty cart contract when none exists.',
        type: cart_dto_1.CartDto,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        get_cart_query_dto_1.GetCartQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerCartController.prototype, "getCurrentCart", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'addCurrentCustomerCartItem',
        summary: 'Add a menu item into the authenticated customer cart',
    }),
    (0, swagger_1.ApiBody)({ type: add_cart_item_dto_1.AddCartItemDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Adds a cart item and returns the updated cart aggregate.',
        type: cart_dto_1.CartDto,
    }),
    (0, common_1.Post)('items'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        add_cart_item_dto_1.AddCartItemDto]),
    __metadata("design:returntype", Promise)
], CustomerCartController.prototype, "addItem", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateCurrentCustomerCartItem',
        summary: 'Update a customer-owned cart item',
    }),
    (0, swagger_1.ApiBody)({ type: update_cart_item_dto_1.UpdateCartItemDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates a cart item and returns the updated cart aggregate.',
        type: cart_dto_1.CartDto,
    }),
    (0, common_1.Patch)('items/:cartItemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('cartItemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CustomerCartController.prototype, "updateItem", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'removeCurrentCustomerCartItem',
        summary: 'Remove a customer-owned cart item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Removes a cart item and returns the updated cart aggregate.',
        type: cart_dto_1.CartDto,
    }),
    (0, common_1.Delete)('items/:cartItemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('cartItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], CustomerCartController.prototype, "removeItem", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'clearCurrentCustomerCart',
        summary: 'Clear the active cart for the authenticated customer and branch',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'branchId',
        description: 'Branch identifier used to scope the active cart clear operation.',
        type: String,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Clears all cart items for the requested branch and returns the resulting empty cart aggregate.',
        type: cart_dto_1.CartDto,
    }),
    (0, common_1.Delete)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        get_cart_query_dto_1.GetCartQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerCartController.prototype, "clearCart", null);
exports.CustomerCartController = CustomerCartController = __decorate([
    (0, swagger_1.ApiTags)('customer-cart'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/cart'),
    __metadata("design:paramtypes", [customer_cart_service_1.CustomerCartService])
], CustomerCartController);
//# sourceMappingURL=customer-cart.controller.js.map