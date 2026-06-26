"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutContextEntity = exports.CheckoutContextBranchEntity = exports.CheckoutContextAddressEntity = exports.CheckoutContextCustomerEntity = void 0;
exports.buildCheckoutContext = buildCheckoutContext;
class CheckoutContextCustomerEntity {
}
exports.CheckoutContextCustomerEntity = CheckoutContextCustomerEntity;
class CheckoutContextAddressEntity {
}
exports.CheckoutContextAddressEntity = CheckoutContextAddressEntity;
class CheckoutContextBranchEntity {
}
exports.CheckoutContextBranchEntity = CheckoutContextBranchEntity;
class CheckoutContextEntity {
}
exports.CheckoutContextEntity = CheckoutContextEntity;
function buildCheckoutContext(input) {
    return {
        currencyCode: input.currencyCode ?? 'MMK',
        customer: {
            customerProfileId: input.customerProfile.id,
            userId: input.customerProfile.user.id,
            phone: input.customerProfile.user.phone,
            role: input.customerProfile.user.role,
            userStatus: input.customerProfile.user.status,
            fullName: input.customerProfile.fullName,
            avatarUrl: input.customerProfile.avatarUrl,
        },
        address: input.address === null
            ? null
            : {
                addressId: input.address.id,
                label: input.address.label,
                line1: input.address.line1,
                line2: input.address.line2,
                landmark: input.address.landmark,
                township: input.address.township,
                city: input.address.city,
                postalCode: input.address.postalCode,
                deliveryInstructions: input.address.deliveryInstructions,
                latitude: input.address.latitude.toString(),
                longitude: input.address.longitude.toString(),
                isDefault: input.address.isDefault,
            },
        branch: {
            branchId: input.branch.id,
            merchantId: input.branch.merchant.id,
            merchantUserId: input.branch.merchant.user.id,
            merchantName: input.branch.merchant.name,
            merchantStatus: input.branch.merchant.status,
            branchName: input.branch.name,
            township: input.branch.township,
            branchStatus: input.branch.status,
        },
        cart: input.cart,
    };
}
//# sourceMappingURL=checkout-context.entity.js.map