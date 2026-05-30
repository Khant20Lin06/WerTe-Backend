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
exports.CheckoutContextService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const addresses_service_1 = require("../../addresses/services/addresses.service");
const branches_service_1 = require("../../branches/services/branches.service");
const cart_query_service_1 = require("../../carts/services/cart-query.service");
const customer_profiles_service_1 = require("../../customer-profiles/services/customer-profiles.service");
const checkout_context_entity_1 = require("../entities/checkout-context.entity");
const checkout_customer_access_policy_helper_1 = require("../policies/checkout-customer-access-policy.helper");
const checkout_validation_service_1 = require("./checkout-validation.service");
let CheckoutContextService = class CheckoutContextService {
    constructor(customerProfilesService, addressesService, branchesService, cartQueryService, checkoutValidationService) {
        this.customerProfilesService = customerProfilesService;
        this.addressesService = addressesService;
        this.branchesService = branchesService;
        this.cartQueryService = cartQueryService;
        this.checkoutValidationService = checkoutValidationService;
    }
    async getValidatedCurrentCustomerCheckoutContext(currentUser, input) {
        const customerProfile = await this.resolveCurrentCustomerProfile(currentUser);
        const address = await this.resolveCheckoutAddress(customerProfile, input.addressId);
        const [branch, cart] = await Promise.all([
            this.resolveBranch(input.branchId),
            this.cartQueryService.getOwnedActiveCartAggregateOrEmpty(currentUser.userId, input.branchId),
        ]);
        await this.checkoutValidationService.assertCartReadyForCheckout(branch, cart);
        return (0, checkout_context_entity_1.buildCheckoutContext)({
            customerProfile,
            address,
            branch,
            cart,
        });
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
        if (!(0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: profile.user.id,
            customerProfileId: profile.id,
        })) {
            throw new app_exception_1.AppException('You are not allowed to access this checkout customer context.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return profile;
    }
    async resolveCheckoutAddress(customerProfile, addressId) {
        if (addressId !== undefined) {
            const address = await this.addressesService.findById(addressId);
            if (address === null ||
                !(0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
                    currentUser: {
                        userId: customerProfile.user.id,
                        sessionId: 'checkout-context',
                        role: customerProfile.user.role,
                        tokenType: 'access',
                        actorContext: {
                            userId: customerProfile.user.id,
                            phone: customerProfile.user.phone,
                            role: customerProfile.user.role,
                            status: customerProfile.user.status,
                            customerProfileId: customerProfile.id,
                        },
                    },
                    ownerUserId: address.customerProfile.user.id,
                    customerProfileId: address.customerProfile.id,
                }) ||
                address.customerProfile.id !== customerProfile.id) {
                throw new app_exception_1.AppException('The requested checkout address was not found.', common_1.HttpStatus.NOT_FOUND, {
                    code: error_codes_1.ErrorCodes.notFound,
                });
            }
            return address;
        }
        const defaultAddress = await this.addressesService.findDefaultByCustomerProfileId(customerProfile.id);
        if (defaultAddress === null) {
            throw new app_exception_1.AppException('A default delivery address is required before checkout.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return defaultAddress;
    }
    async resolveBranch(branchId) {
        const branch = await this.branchesService.findById(branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return branch;
    }
};
exports.CheckoutContextService = CheckoutContextService;
exports.CheckoutContextService = CheckoutContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_profiles_service_1.CustomerProfilesService,
        addresses_service_1.AddressesService,
        branches_service_1.BranchesService,
        cart_query_service_1.CartQueryService,
        checkout_validation_service_1.CheckoutValidationService])
], CheckoutContextService);
//# sourceMappingURL=checkout-context.service.js.map