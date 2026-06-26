"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const checkout_preview_service_1 = require("../../../../src/modules/checkout/services/checkout-preview.service");
const checkout_pricing_service_1 = require("../../../../src/modules/checkout/services/checkout-pricing.service");
function makeCheckoutContext(overrides) {
    return {
        currencyCode: 'MMK',
        customer: {
            customerProfileId: 'cust_prof_1',
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            userStatus: client_1.UserStatus.ACTIVE,
            fullName: 'Mg Mg',
            avatarUrl: null,
        },
        address: {
            addressId: 'addr_1',
            label: 'Home',
            line1: 'No. 1, Main Road',
            line2: null,
            landmark: null,
            township: 'Botahtaung',
            city: 'Yangon',
            postalCode: null,
            deliveryInstructions: 'Call before arrival',
            latitude: '16.834',
            longitude: '96.176',
            isDefault: true,
        },
        branch: {
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            merchantUserId: 'usr_merchant_1',
            merchantName: 'Merchant One',
            merchantStatus: 'ACTIVE',
            branchName: 'Downtown Branch',
            township: 'Botahtaung',
            branchStatus: 'ACTIVE',
        },
        cart: {
            cartId: 'cart_1',
            customerProfileId: 'cust_prof_1',
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            branchName: 'Downtown Branch',
            branchStatus: 'ACTIVE',
            merchantStatus: 'ACTIVE',
            status: 'ACTIVE',
            totalQuantity: 2,
            subtotalAmount: '6500',
            totalAmount: '6500',
            isEmpty: false,
            items: [],
        },
        ...overrides,
    };
}
describe('CheckoutPreviewService', () => {
    it('builds a checkout preview from the validated checkout context', async () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)();
        const checkoutContextService = {
            getValidatedCurrentCustomerCheckoutContext: jest
                .fn()
                .mockResolvedValue(makeCheckoutContext()),
        };
        const checkoutPricingService = new checkout_pricing_service_1.CheckoutPricingService({
            evaluatePromotionForCheckout: jest.fn().mockResolvedValue(null),
        });
        const service = new checkout_preview_service_1.CheckoutPreviewService(checkoutContextService, checkoutPricingService);
        const result = await service.previewCurrentCustomerCheckout(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
        });
        expect(checkoutContextService.getValidatedCurrentCustomerCheckoutContext).toHaveBeenCalledWith(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
        });
        expect(result).toMatchObject({
            currencyCode: 'MMK',
            cart: {
                cartId: 'cart_1',
            },
            pricing: {
                subtotalAmount: '6500',
                discountAmount: '0',
                deliveryFee: '0',
                totalAmount: '6500',
            },
        });
    });
});
//# sourceMappingURL=checkout-preview.service.spec.js.map