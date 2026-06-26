"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionEntity = exports.promotionSelect = void 0;
exports.buildPromotionEntity = buildPromotionEntity;
const client_1 = require("@prisma/client");
exports.promotionSelect = client_1.Prisma.validator()({
    id: true,
    branchId: true,
    code: true,
    name: true,
    description: true,
    discountType: true,
    discountValue: true,
    minimumSubtotalAmount: true,
    maximumDiscountAmount: true,
    perCustomerLimit: true,
    startsAt: true,
    endsAt: true,
    isActive: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
});
class PromotionEntity {
}
exports.PromotionEntity = PromotionEntity;
function buildPromotionEntity(record) {
    return {
        promotionId: record.id,
        branchId: record.branchId,
        code: record.code,
        name: record.name,
        description: record.description,
        discountType: record.discountType,
        discountValue: record.discountValue.toString(),
        minimumSubtotalAmount: record.minimumSubtotalAmount.toString(),
        maximumDiscountAmount: record.maximumDiscountAmount?.toString() ?? null,
        perCustomerLimit: record.perCustomerLimit,
        startsAt: record.startsAt?.toISOString() ?? null,
        endsAt: record.endsAt?.toISOString() ?? null,
        isActive: record.isActive,
        deletedAt: record.deletedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=promotion.entity.js.map