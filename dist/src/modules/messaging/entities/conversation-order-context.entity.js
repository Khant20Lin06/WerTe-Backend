"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationOrderContextEntity = exports.conversationOrderContextSelect = void 0;
exports.buildConversationOrderContext = buildConversationOrderContext;
exports.supportsAssignedRiderConversation = supportsAssignedRiderConversation;
const client_1 = require("@prisma/client");
exports.conversationOrderContextSelect = client_1.Prisma.validator()({
    id: true,
    orderCode: true,
    status: true,
    customerProfile: {
        select: {
            id: true,
            userId: true,
        },
    },
    branch: {
        select: {
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
    delivery: {
        select: {
            id: true,
            rider: {
                select: {
                    id: true,
                    userId: true,
                    displayName: true,
                },
            },
        },
    },
});
class ConversationOrderContextEntity {
}
exports.ConversationOrderContextEntity = ConversationOrderContextEntity;
function buildConversationOrderContext(record) {
    return {
        orderId: record.id,
        orderCode: record.orderCode,
        status: record.status,
        customer: {
            customerProfileId: record.customerProfile.id,
            userId: record.customerProfile.userId,
        },
        merchant: {
            merchantId: record.branch.merchant.id,
            userId: record.branch.merchant.userId,
            merchantName: record.branch.merchant.name,
        },
        branch: {
            branchName: record.branch.name,
        },
        deliveryId: record.delivery?.id ?? null,
        rider: record.delivery?.rider === null || record.delivery?.rider === undefined
            ? null
            : {
                riderId: record.delivery.rider.id,
                userId: record.delivery.rider.userId,
                displayName: record.delivery.rider.displayName,
            },
    };
}
function supportsAssignedRiderConversation(type) {
    return (type === client_1.ConversationType.ORDER_CHAT ||
        type === client_1.ConversationType.CUSTOMER_RIDER ||
        type === client_1.ConversationType.MERCHANT_RIDER ||
        type === client_1.ConversationType.RIDER_OPERATIONS);
}
//# sourceMappingURL=conversation-order-context.entity.js.map