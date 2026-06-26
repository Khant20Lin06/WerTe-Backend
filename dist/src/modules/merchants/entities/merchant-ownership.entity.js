"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantOwnershipEntity = exports.merchantOwnershipInclude = void 0;
exports.buildMerchantOwnership = buildMerchantOwnership;
const client_1 = require("@prisma/client");
exports.merchantOwnershipInclude = client_1.Prisma.validator()({
    user: {
        select: {
            id: true,
            phone: true,
            role: true,
            status: true,
        },
    },
});
class MerchantOwnershipEntity {
}
exports.MerchantOwnershipEntity = MerchantOwnershipEntity;
function buildMerchantOwnership(merchant) {
    return {
        merchantId: merchant.id,
        userId: merchant.user.id,
        phone: merchant.user.phone,
        role: merchant.user.role,
        userStatus: merchant.user.status,
        name: merchant.name,
        supportPhone: merchant.supportPhone,
        storeType: merchant.storeType,
        status: merchant.status,
    };
}
//# sourceMappingURL=merchant-ownership.entity.js.map