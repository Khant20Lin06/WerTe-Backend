"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSummaryEntity = exports.PaymentSummaryRefundEntity = exports.PaymentSummaryOrderEntity = exports.PaymentSummaryCustomerEntity = exports.paymentSummaryInclude = void 0;
exports.buildPaymentSummaryEntity = buildPaymentSummaryEntity;
const client_1 = require("@prisma/client");
exports.paymentSummaryInclude = client_1.Prisma.validator()({
    order: {
        select: {
            id: true,
            orderCode: true,
            status: true,
            totalAmount: true,
            currencyCode: true,
            placedAt: true,
            branch: {
                select: {
                    id: true,
                    name: true,
                    merchant: {
                        select: {
                            id: true,
                            userId: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
    customerProfile: {
        select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            user: {
                select: {
                    id: true,
                    phone: true,
                    status: true,
                },
            },
        },
    },
    refunds: {
        orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
        select: {
            id: true,
            status: true,
            amount: true,
            currencyCode: true,
            providerReference: true,
            reasonCode: true,
            note: true,
            requestedAt: true,
            succeededAt: true,
            failedAt: true,
            cancelledAt: true,
            createdByUser: {
                select: {
                    id: true,
                    role: true,
                    phone: true,
                },
            },
        },
    },
});
class PaymentSummaryCustomerEntity {
}
exports.PaymentSummaryCustomerEntity = PaymentSummaryCustomerEntity;
class PaymentSummaryOrderEntity {
}
exports.PaymentSummaryOrderEntity = PaymentSummaryOrderEntity;
class PaymentSummaryRefundEntity {
}
exports.PaymentSummaryRefundEntity = PaymentSummaryRefundEntity;
class PaymentSummaryEntity {
}
exports.PaymentSummaryEntity = PaymentSummaryEntity;
function buildPaymentSummaryEntity(payment) {
    return {
        paymentId: payment.id,
        orderId: payment.orderId,
        customerProfileId: payment.customerProfileId,
        method: payment.method,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount.toString(),
        refundedAmount: payment.refundedAmount.toString(),
        currencyCode: payment.currencyCode,
        idempotencyKey: payment.idempotencyKey ?? null,
        providerReference: payment.providerReference ?? null,
        providerReceiptId: payment.providerReceiptId ?? null,
        failureCode: payment.failureCode ?? null,
        failureMessage: payment.failureMessage ?? null,
        metadata: payment.metadataJson ?? null,
        requiresActionAt: payment.requiresActionAt?.toISOString() ?? null,
        succeededAt: payment.succeededAt?.toISOString() ?? null,
        failedAt: payment.failedAt?.toISOString() ?? null,
        cancelledAt: payment.cancelledAt?.toISOString() ?? null,
        expiredAt: payment.expiredAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        customer: {
            customerProfileId: payment.customerProfile.id,
            userId: payment.customerProfile.user.id,
            phone: payment.customerProfile.user.phone,
            userStatus: payment.customerProfile.user.status,
            fullName: payment.customerProfile.fullName,
            avatarUrl: payment.customerProfile.avatarUrl,
        },
        order: {
            orderId: payment.order.id,
            orderCode: payment.order.orderCode,
            status: payment.order.status,
            totalAmount: payment.order.totalAmount.toString(),
            currencyCode: payment.order.currencyCode,
            placedAt: payment.order.placedAt.toISOString(),
            branchId: payment.order.branch.id,
            branchName: payment.order.branch.name,
            merchantId: payment.order.branch.merchant.id,
            merchantUserId: payment.order.branch.merchant.userId,
            merchantName: payment.order.branch.merchant.name,
        },
        refunds: payment.refunds.map((refund) => ({
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount.toString(),
            currencyCode: refund.currencyCode,
            providerReference: refund.providerReference ?? null,
            reasonCode: refund.reasonCode ?? null,
            note: refund.note ?? null,
            requestedAt: refund.requestedAt.toISOString(),
            succeededAt: refund.succeededAt?.toISOString() ?? null,
            failedAt: refund.failedAt?.toISOString() ?? null,
            cancelledAt: refund.cancelledAt?.toISOString() ?? null,
            createdByUserId: refund.createdByUser?.id ?? null,
            createdByUserRole: refund.createdByUser?.role ?? null,
            createdByUserPhone: refund.createdByUser?.phone ?? null,
        })),
    };
}
//# sourceMappingURL=payment-summary.entity.js.map