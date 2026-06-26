"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
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
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            branchName: 'Downtown Branch',
            township: 'Botahtaung',
            branchStatus: client_1.BranchStatus.ACTIVE,
        },
        cart: {
            cartId: 'cart_1',
            customerProfileId: 'cust_prof_1',
            branchId: 'branch_1',
            merchantId: 'merchant_1',
            branchName: 'Downtown Branch',
            branchStatus: client_1.BranchStatus.ACTIVE,
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            status: client_1.CartStatus.ACTIVE,
            totalQuantity: 2,
            subtotalAmount: '6500',
            totalAmount: '6500',
            isEmpty: false,
            items: [],
        },
        ...overrides,
    };
}
describe('CheckoutPricingService', () => {
    const makePromotionPricingService = () => ({
        evaluatePromotionForCheckout: jest.fn().mockResolvedValue(null),
    });
    it('builds a preview pricing breakdown from the validated checkout context', async () => {
        const service = new checkout_pricing_service_1.CheckoutPricingService(makePromotionPricingService());
        const result = await service.buildPricingBreakdown(makeCheckoutContext());
        expect(result.subtotalAmount.toString()).toBe('6500');
        expect(result.discountAmount.toString()).toBe('0');
        expect(result.deliveryFee.toString()).toBe('0');
        expect(result.totalAmount.toString()).toBe('6500');
    });
    it('builds a checkout preview aggregate with nested context and serialized totals', async () => {
        const service = new checkout_pricing_service_1.CheckoutPricingService(makePromotionPricingService());
        const result = await service.buildCheckoutPreview(makeCheckoutContext());
        expect(result).toMatchObject({
            currencyCode: 'MMK',
            customer: {
                customerProfileId: 'cust_prof_1',
            },
            address: {
                addressId: 'addr_1',
            },
            branch: {
                branchId: 'branch_1',
            },
            cart: {
                cartId: 'cart_1',
            },
            pricing: {
                currencyCode: 'MMK',
                subtotalAmount: '6500',
                discountAmount: '0',
                deliveryFee: '0',
                totalAmount: '6500',
            },
        });
    });
    it('applies the resolved promotion discount to the pricing breakdown', async () => {
        const service = new checkout_pricing_service_1.CheckoutPricingService({
            evaluatePromotionForCheckout: jest.fn().mockResolvedValue({
                promotionId: 'promo_1',
                code: 'SAVE10',
                name: 'Save 10 percent',
                discountType: client_1.PromotionDiscountType.PERCENTAGE,
                discountAmount: new client_1.Prisma.Decimal('650'),
                appliedPromotion: {
                    promotionId: 'promo_1',
                    code: 'SAVE10',
                    name: 'Save 10 percent',
                    discountType: client_1.PromotionDiscountType.PERCENTAGE,
                    discountAmount: '650',
                },
            }),
        });
        const result = await service.buildPricingBreakdown(makeCheckoutContext(), {
            promotionCode: 'save10',
        });
        expect(result.discountAmount.toString()).toBe('650');
        expect(result.totalAmount.toString()).toBe('5850');
        expect(result.appliedPromotion).toMatchObject({
            code: 'SAVE10',
            discountAmount: '650',
        });
    });
});
//# sourceMappingURL=checkout-pricing.service.spec.js.map