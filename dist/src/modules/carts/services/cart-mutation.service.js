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
exports.CartMutationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const customer_profiles_service_1 = require("../../customer-profiles/services/customer-profiles.service");
const menus_service_1 = require("../../menus/services/menus.service");
const customer_cart_access_policy_helper_1 = require("../policies/customer-cart-access-policy.helper");
const carts_repository_1 = require("../repositories/carts.repository");
const cart_pricing_service_1 = require("./cart-pricing.service");
const cart_query_service_1 = require("./cart-query.service");
let CartMutationService = class CartMutationService {
    constructor(prisma, customerProfilesService, menusService, cartsRepository, cartPricingService, cartQueryService) {
        this.prisma = prisma;
        this.customerProfilesService = customerProfilesService;
        this.menusService = menusService;
        this.cartsRepository = cartsRepository;
        this.cartPricingService = cartPricingService;
        this.cartQueryService = cartQueryService;
    }
    async addCurrentCustomerCartItem(currentUser, branchId, payload) {
        this.assertPositiveQuantity(payload.quantity);
        const profile = await this.resolveCurrentCustomerProfile(currentUser);
        const menuItem = await this.resolveMenuItemForBranch(branchId, payload.menuItemId);
        const selectedOptions = await this.resolveSelectedOptionsForMenuItem(menuItem.id, payload.selectedOptionIds ?? [], payload.quantity);
        const unitPriceSnapshot = this.cartPricingService.computeUnitPriceSnapshot(menuItem, selectedOptions);
        const lineTotal = this.cartPricingService.computeLineTotal(payload.quantity, unitPriceSnapshot);
        const cartId = await this.prisma.runInTransaction(async (tx) => {
            const cart = (await this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(profile.id, branchId, tx)) ??
                (await this.cartsRepository.createCart({
                    customerProfileId: profile.id,
                    branchId,
                    totalQuantity: 0,
                    subtotalAmount: 0,
                    totalAmount: 0,
                }, tx));
            const cartItem = await this.cartsRepository.createCartItem({
                cartId: cart.id,
                menuItemId: menuItem.id,
                quantity: payload.quantity,
                unitPriceSnapshot,
                lineTotal,
            }, tx);
            await this.cartsRepository.createCartItemOptions(selectedOptions.map((option) => ({
                cartItemId: cartItem.id,
                itemOptionId: option.id,
                nameSnapshot: option.name,
                priceDeltaSnapshot: option.priceDelta,
            })), tx);
            await this.cartPricingService.recomputeCartTotals(cart.id, tx);
            return cart.id;
        });
        return this.resolveCartAggregateOrThrow(cartId);
    }
    async updateCurrentCustomerCartItem(currentUser, cartItemId, payload) {
        this.assertPositiveQuantity(payload.quantity);
        const cartItem = await this.resolveOwnedCartItem(currentUser, cartItemId);
        const menuItem = await this.resolveMenuItemForBranch(cartItem.cart.branch.id, cartItem.menuItem.id);
        const cartId = await this.prisma.runInTransaction(async (tx) => {
            let unitPriceSnapshot = new client_1.Prisma.Decimal(cartItem.unitPriceSnapshot);
            if (payload.selectedOptionIds !== undefined) {
                const selectedOptions = await this.resolveSelectedOptionsForMenuItem(menuItem.id, payload.selectedOptionIds, payload.quantity);
                unitPriceSnapshot = this.cartPricingService.computeUnitPriceSnapshot(menuItem, selectedOptions);
                await this.cartsRepository.deleteCartItemOptionsByCartItemId(cartItem.id, tx);
                await this.cartsRepository.createCartItemOptions(selectedOptions.map((option) => ({
                    cartItemId: cartItem.id,
                    itemOptionId: option.id,
                    nameSnapshot: option.name,
                    priceDeltaSnapshot: option.priceDelta,
                })), tx);
            }
            else {
                const existingCartItemOptions = await this.cartsRepository.listCartItemOptionsByCartItemIdWithClient(cartItem.id, tx);
                await this.resolveSelectedOptionsForMenuItem(menuItem.id, existingCartItemOptions.map((option) => option.itemOption.id), payload.quantity);
            }
            await this.cartsRepository.updateCartItem(cartItem.id, {
                quantity: payload.quantity,
                unitPriceSnapshot,
                lineTotal: this.cartPricingService.computeLineTotal(payload.quantity, unitPriceSnapshot),
            }, tx);
            await this.cartPricingService.recomputeCartTotals(cartItem.cart.id, tx);
            return cartItem.cart.id;
        });
        return this.resolveCartAggregateOrThrow(cartId);
    }
    async removeCurrentCustomerCartItem(currentUser, cartItemId) {
        const cartItem = await this.resolveOwnedCartItem(currentUser, cartItemId);
        const cartId = await this.prisma.runInTransaction(async (tx) => {
            await this.cartsRepository.deleteCartItemOptionsByCartItemId(cartItem.id, tx);
            await this.cartsRepository.deleteCartItem(cartItem.id, tx);
            await this.cartPricingService.recomputeCartTotals(cartItem.cart.id, tx);
            return cartItem.cart.id;
        });
        return this.resolveCartAggregateOrThrow(cartId);
    }
    async clearCurrentCustomerBranchCart(currentUser, branchId) {
        const profile = await this.resolveCurrentCustomerProfile(currentUser);
        const cart = await this.cartsRepository.findActiveCartByCustomerProfileIdAndBranchId(profile.id, branchId);
        if (cart === null) {
            return this.cartQueryService.buildEmptyCartAggregate(branchId);
        }
        await this.prisma.runInTransaction(async (tx) => {
            await this.cartsRepository.deleteCartItemOptionsByCartId(cart.id, tx);
            await this.cartsRepository.deleteCartItemsByCartId(cart.id, tx);
            await this.cartPricingService.recomputeCartTotals(cart.id, tx);
        });
        return this.resolveCartAggregateOrThrow(cart.id);
    }
    async resolveCurrentCustomerProfile(currentUser) {
        const actorCustomerProfileId = currentUser.actorContext.customerProfileId;
        const profile = actorCustomerProfileId !== undefined
            ? await this.customerProfilesService.findOwnedByUserId(currentUser.userId, actorCustomerProfileId)
            : await this.customerProfilesService.findByUserId(currentUser.userId);
        if (profile === null) {
            throw new app_exception_1.AppException('Customer profile was not found for the authenticated user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!(0, customer_cart_access_policy_helper_1.hasCustomerCartAccess)({
            currentUser,
            ownerUserId: profile.user.id,
            customerProfileId: profile.id,
        })) {
            throw new app_exception_1.AppException('You are not allowed to access this customer cart context.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return profile;
    }
    async resolveOwnedCartItem(currentUser, cartItemId) {
        const cartItem = await this.cartsRepository.findCartItemById(cartItemId);
        if (cartItem === null ||
            !(0, customer_cart_access_policy_helper_1.hasCustomerCartAccess)({
                currentUser,
                ownerUserId: cartItem.cart.customerProfile.user.id,
                customerProfileId: cartItem.cart.customerProfile.id,
            })) {
            throw new app_exception_1.AppException('Cart item was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return cartItem;
    }
    async resolveMenuItemForBranch(branchId, menuItemId) {
        const menuItem = await this.menusService.findItemById(menuItemId);
        if (menuItem === null || menuItem.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!menuItem.isAvailable) {
            throw new app_exception_1.AppException('The requested menu item is not currently available.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return menuItem;
    }
    async resolveSelectedOptionsForMenuItem(menuItemId, selectedOptionIds, quantity) {
        this.assertNoDuplicateOptionSelection(selectedOptionIds);
        const optionGroups = await this.menusService.listOptionGroupsByMenuItemId(menuItemId);
        const activeGroups = optionGroups.filter((group) => group.isActive);
        const optionsByGroup = await Promise.all(activeGroups.map(async (group) => ({
            group,
            options: (await this.menusService.listOptionsByOptionGroupId(group.id)).filter((option) => option.isActive),
        })));
        const optionMap = new Map();
        const selectionCountByGroup = new Map();
        for (const entry of optionsByGroup) {
            for (const option of entry.options) {
                optionMap.set(option.id, option);
            }
            selectionCountByGroup.set(entry.group.id, 0);
        }
        const selectedOptions = selectedOptionIds.map((optionId) => {
            const option = optionMap.get(optionId);
            if (option === undefined) {
                throw new app_exception_1.AppException('One or more selected item options are not valid for the requested menu item.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                });
            }
            selectionCountByGroup.set(option.group.id, (selectionCountByGroup.get(option.group.id) ?? 0) + 1);
            return option;
        });
        for (const group of activeGroups) {
            const selectedCount = selectionCountByGroup.get(group.id) ?? 0;
            if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
                throw new app_exception_1.AppException('Selected item options do not satisfy the option group selection rules.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                    details: {
                        optionGroupId: group.id,
                        minSelect: group.minSelect,
                        maxSelect: group.maxSelect,
                        selectedCount,
                    },
                });
            }
        }
        this.assertSelectedOptionsHaveAvailableStock(selectedOptions, quantity);
        await this.assertSelectedVariantCombinationIsValid(menuItemId, selectedOptions, quantity);
        return selectedOptions;
    }
    async resolveCartAggregateOrThrow(cartId) {
        const aggregate = await this.cartQueryService.findCartAggregateById(cartId);
        if (aggregate === null) {
            throw new app_exception_1.AppException('Cart aggregate was not found after the requested mutation.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        return this.cartQueryService.buildCartAggregate(aggregate);
    }
    async assertSelectedVariantCombinationIsValid(menuItemId, selectedOptions, quantity) {
        const selectedVariantOptionIds = selectedOptions
            .filter((option) => option.group.kind === client_1.ItemOptionGroupKind.VARIANT_SELECTOR)
            .map((option) => option.id);
        if (selectedVariantOptionIds.length === 0) {
            return;
        }
        const combination = await this.menusService.findActiveVariantCombinationByMenuItemIdAndOptionIds(menuItemId, selectedVariantOptionIds);
        if (combination === null) {
            throw new app_exception_1.AppException('Selected variant options do not match an active variant combination for the requested menu item.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    menuItemId,
                    selectedVariantOptionIds,
                },
            });
        }
        if (combination.isStockTracked &&
            (combination.stockQuantity ?? 0) < quantity) {
            throw new app_exception_1.AppException('The selected variant combination does not have enough remaining stock.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    combinationId: combination.id,
                    stockQuantity: combination.stockQuantity ?? 0,
                    requestedQuantity: quantity,
                },
            });
        }
    }
    assertPositiveQuantity(quantity) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new app_exception_1.AppException('Cart item quantity must be a positive integer.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    quantity,
                },
            });
        }
    }
    assertNoDuplicateOptionSelection(selectedOptionIds) {
        if (new Set(selectedOptionIds).size !== selectedOptionIds.length) {
            throw new app_exception_1.AppException('Each selected item option must be unique within a cart item.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    assertSelectedOptionsHaveAvailableStock(selectedOptions, quantity) {
        const unavailableOption = selectedOptions.find((option) => {
            if (!option.isStockTracked) {
                return false;
            }
            return (option.stockQuantity ?? 0) < quantity;
        });
        if (unavailableOption === undefined) {
            return;
        }
        throw new app_exception_1.AppException('One or more selected item variants or add-ons do not have enough stock for the requested quantity.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
            code: error_codes_1.ErrorCodes.unprocessableEntity,
            details: {
                optionId: unavailableOption.id,
                stockQuantity: unavailableOption.stockQuantity ?? 0,
                requestedQuantity: quantity,
            },
        });
    }
};
exports.CartMutationService = CartMutationService;
exports.CartMutationService = CartMutationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_profiles_service_1.CustomerProfilesService,
        menus_service_1.MenusService,
        carts_repository_1.CartsRepository,
        cart_pricing_service_1.CartPricingService,
        cart_query_service_1.CartQueryService])
], CartMutationService);
//# sourceMappingURL=cart-mutation.service.js.map