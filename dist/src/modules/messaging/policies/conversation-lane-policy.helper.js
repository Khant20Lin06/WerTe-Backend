"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresAssignedRiderConversationType = requiresAssignedRiderConversationType;
exports.isOperationsConversationType = isOperationsConversationType;
exports.includesSystemParticipant = includesSystemParticipant;
const client_1 = require("@prisma/client");
function requiresAssignedRiderConversationType(type) {
    return (type === client_1.ConversationType.ORDER_CHAT ||
        type === client_1.ConversationType.CUSTOMER_RIDER ||
        type === client_1.ConversationType.MERCHANT_RIDER ||
        type === client_1.ConversationType.RIDER_OPERATIONS);
}
function isOperationsConversationType(type) {
    return (type === client_1.ConversationType.CUSTOMER_OPERATIONS ||
        type === client_1.ConversationType.MERCHANT_OPERATIONS ||
        type === client_1.ConversationType.RIDER_OPERATIONS);
}
function includesSystemParticipant(type) {
    return type === client_1.ConversationType.ORDER_CHAT;
}
//# sourceMappingURL=conversation-lane-policy.helper.js.map