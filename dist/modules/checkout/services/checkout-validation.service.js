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
exports.CheckoutValidationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const menus_service_1 = require("../../menus/services/menus.service");
let CheckoutValidationService = class CheckoutValidationService {
    constructor(menusService) {
        this.menusService = menusService;
    }
    async assertCartReadyForCheckout(branch, cart) {
        this.assertBranchIsOrderable(branch);
        this.assertCartIsNotEmpty(cart);
        this.assertCartBranchMatches(branch, cart);
        for (const item of cart.items) {
            this.assertMenuItemIsAvailable(item);
            await this.assertCartItemSelectionsRemainValid(item);
        }
    }
    assertBranchIsOrderable(branch) {
        if (branch.status !== client_1.BranchStatus.ACTIVE) {
            throw new app_exception_1.AppException('The requested branch is not currently accepting checkout requests.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    branchId: branch.id,
                    branchStatus: branch.status,
                },
            });
        }
        if (branch.merchant.status !== client_1.MerchantStatus.ACTIVE) {
            throw new app_exception_1.AppException('The merchant that owns the requested branch is not currently orderable.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    branchId: branch.id,
                    merchantId: branch.merchant.id,
                    merchantStatus: branch.merchant.status,
                },
            });
        }
    }
    assertCartIsNotEmpty(cart) {
        if (cart.isEmpty || cart.cartId === null || cart.items.length === 0) {
            throw new app_exception_1.AppException('A non-empty active cart is required before checkout.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    assertCartBranchMatches(branch, cart) {
        if (cart.branchId !== branch.id) {
            throw new app_exception_1.AppException('The requested cart does not belong to the requested branch.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    cartBranchId: cart.branchId,
                    requestedBranchId: branch.id,
                },
            });
        }
    }
    assertMenuItemIsAvailable(item) {
        if (!item.menuItemIsAvailable) {
            throw new app_exception_1.AppException('One or more cart items are no longer available for checkout.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    cartItemId: item.cartItemId,
                    menuItemId: item.menuItemId,
                },
            });
        }
    }
    async assertCartItemSelectionsRemainValid(item) {
        const optionGroups = await this.menusService.listOptionGroupsByMenuItemId(item.menuItemId);
        const activeGroups = optionGroups.filter((group) => group.isActive);
        const selectionCountByGroup = new Map();
        const activeOptionsById = new Map();
        for (const group of activeGroups) {
            selectionCountByGroup.set(group.id, 0);
            const options = await this.menusService.listOptionsByOptionGroupId(group.id);
            for (const option of options) {
                if (option.isActive) {
                    activeOptionsById.set(option.id, group.id);
                }
            }
        }
        for (const selectedOption of item.selectedOptions) {
            const expectedGroupId = activeOptionsById.get(selectedOption.itemOptionId);
            if (expectedGroupId === undefined) {
                throw new app_exception_1.AppException('One or more selected cart item options are no longer valid for checkout.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                    details: {
                        cartItemId: item.cartItemId,
                        itemOptionId: selectedOption.itemOptionId,
                    },
                });
            }
            selectionCountByGroup.set(expectedGroupId, (selectionCountByGroup.get(expectedGroupId) ?? 0) + 1);
        }
        for (const group of activeGroups) {
            const selectedCount = selectionCountByGroup.get(group.id) ?? 0;
            if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
                throw new app_exception_1.AppException('Selected cart item options no longer satisfy the option group selection rules.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                    details: {
                        cartItemId: item.cartItemId,
                        menuItemId: item.menuItemId,
                        optionGroupId: group.id,
                        minSelect: group.minSelect,
                        maxSelect: group.maxSelect,
                        selectedCount,
                    },
                });
            }
        }
    }
};
exports.CheckoutValidationService = CheckoutValidationService;
exports.CheckoutValidationService = CheckoutValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], CheckoutValidationService);
//# sourceMappingURL=checkout-validation.service.js.map