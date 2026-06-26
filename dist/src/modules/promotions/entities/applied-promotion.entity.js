"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppliedPromotionEntity = void 0;
exports.buildAppliedPromotionEntity = buildAppliedPromotionEntity;
exports.buildAppliedPromotionEntityFromSnapshot = buildAppliedPromotionEntityFromSnapshot;
const client_1 = require("@prisma/client");
class AppliedPromotionEntity {
}
exports.AppliedPromotionEntity = AppliedPromotionEntity;
function buildAppliedPromotionEntity(input) {
    return {
        promotionId: input.promotionId,
        code: input.code,
        name: input.name,
        discountType: input.discountType,
        discountAmount: new client_1.Prisma.Decimal(input.discountAmount).toString(),
    };
}
function buildAppliedPromotionEntityFromSnapshot(input) {
    if (input.promotionId === undefined ||
        input.promotionId === null ||
        input.promotionCodeSnapshot === undefined ||
        input.promotionCodeSnapshot === null ||
        input.promotionNameSnapshot === undefined ||
        input.promotionNameSnapshot === null ||
        input.promotionDiscountTypeSnapshot === undefined ||
        input.promotionDiscountTypeSnapshot === null) {
        return null;
    }
    return buildAppliedPromotionEntity({
        promotionId: input.promotionId,
        code: input.promotionCodeSnapshot,
        name: input.promotionNameSnapshot,
        discountType: input.promotionDiscountTypeSnapshot,
        discountAmount: input.discountAmount ?? 0,
    });
}
//# sourceMappingURL=applied-promotion.entity.js.map