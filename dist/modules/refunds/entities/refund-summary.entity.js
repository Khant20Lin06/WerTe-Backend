"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundSummaryEntity = exports.RefundSummaryCreatedByUserEntity = exports.RefundSummaryOrderEntity = exports.RefundSummaryPaymentEntity = exports.refundSummaryInclude = void 0;
exports.buildRefundSummaryEntity = buildRefundSummaryEntity;
const client_1 = require("@prisma/client");
exports.refundSummaryInclude = client_1.Prisma.validator()({
    payment: {
        select: {
            id: true,
            customerProfileId: true,
            method: true,
            provider: true,
            status: true,
            amount: true,
            refundedAmount: true,
            currencyCode: true,
            providerReference: true,
            providerReceiptId: true,
        },
    },
    order: {
        select: {
            id: true,
            orderCode: true,
            status: true,
            customerProfileId: true,
            totalAmount: true,
            currencyCode: true,
        },
    },
    createdByUser: {
        select: {
            id: true,
            role: true,
            phone: true,
            status: true,
        },
    },
});
class RefundSummaryPaymentEntity {
}
exports.RefundSummaryPaymentEntity = RefundSummaryPaymentEntity;
class RefundSummaryOrderEntity {
}
exports.RefundSummaryOrderEntity = RefundSummaryOrderEntity;
class RefundSummaryCreatedByUserEntity {
}
exports.RefundSummaryCreatedByUserEntity = RefundSummaryCreatedByUserEntity;
class RefundSummaryEntity {
}
exports.RefundSummaryEntity = RefundSummaryEntity;
function buildRefundSummaryEntity(refund) {
    return {
        refundId: refund.id,
        paymentId: refund.paymentId,
        orderId: refund.orderId,
        createdByUserId: refund.createdByUserId ?? null,
        status: refund.status,
        amount: refund.amount.toString(),
        currencyCode: refund.currencyCode,
        idempotencyKey: refund.idempotencyKey ?? null,
        providerReference: refund.providerReference ?? null,
        reasonCode: refund.reasonCode ?? null,
        note: refund.note ?? null,
        failureCode: refund.failureCode ?? null,
        failureMessage: refund.failureMessage ?? null,
        metadata: refund.metadataJson ?? null,
        requestedAt: refund.requestedAt.toISOString(),
        succeededAt: refund.succeededAt?.toISOString() ?? null,
        failedAt: refund.failedAt?.toISOString() ?? null,
        cancelledAt: refund.cancelledAt?.toISOString() ?? null,
        createdAt: refund.createdAt.toISOString(),
        updatedAt: refund.updatedAt.toISOString(),
        payment: {
            paymentId: refund.payment.id,
            customerProfileId: refund.payment.customerProfileId,
            method: refund.payment.method,
            provider: refund.payment.provider,
            status: refund.payment.status,
            amount: refund.payment.amount.toString(),
            refundedAmount: refund.payment.refundedAmount.toString(),
            currencyCode: refund.payment.currencyCode,
            providerReference: refund.payment.providerReference ?? null,
            providerReceiptId: refund.payment.providerReceiptId ?? null,
        },
        order: {
            orderId: refund.order.id,
            orderCode: refund.order.orderCode,
            status: refund.order.status,
            customerProfileId: refund.order.customerProfileId,
            totalAmount: refund.order.totalAmount.toString(),
            currencyCode: refund.order.currencyCode,
        },
        createdByUser: refund.createdByUser === null
            ? null
            : {
                userId: refund.createdByUser.id,
                role: refund.createdByUser.role,
                phone: refund.createdByUser.phone,
                status: refund.createdByUser.status,
            },
    };
}
//# sourceMappingURL=refund-summary.entity.js.map