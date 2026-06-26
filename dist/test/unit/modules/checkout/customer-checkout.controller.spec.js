"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const customer_checkout_controller_1 = require("../../../../src/modules/checkout/controllers/customer-checkout.controller");
function makeCheckoutPreview(overrides) {
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
        pricing: {
            currencyCode: 'MMK',
            subtotalAmount: '6500',
            discountAmount: '0',
            deliveryFee: '0',
            totalAmount: '6500',
        },
        ...overrides,
    };
}
describe('CustomerCheckoutController', () => {
    it('delegates preview requests to the checkout preview service and maps the response DTO', async () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        const checkoutPreviewService = {
            previewCurrentCustomerCheckout: jest
                .fn()
                .mockResolvedValue(makeCheckoutPreview()),
        };
        const controller = new customer_checkout_controller_1.CustomerCheckoutController(checkoutPreviewService);
        const result = await controller.preview(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
        });
        expect(checkoutPreviewService.previewCurrentCustomerCheckout).toHaveBeenCalledWith(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
            promotionCode: undefined,
        });
        expect(result).toMatchObject({
            currencyCode: 'MMK',
            customer: {
                customerProfileId: 'cust_prof_1',
            },
            branch: {
                branchId: 'branch_1',
            },
            cart: {
                cartId: 'cart_1',
            },
            pricing: {
                totalAmount: '6500',
            },
        });
    });
});
//# sourceMappingURL=customer-checkout.controller.spec.js.map