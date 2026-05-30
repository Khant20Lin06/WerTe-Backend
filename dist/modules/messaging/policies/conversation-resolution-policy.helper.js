"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canResolveConversationForOrder = canResolveConversationForOrder;
exports.buildConversationParticipants = buildConversationParticipants;
exports.buildConversationTitle = buildConversationTitle;
const client_1 = require("@prisma/client");
const conversation_lane_policy_helper_1 = require("./conversation-lane-policy.helper");
function canResolveConversationForOrder({ currentUser, order, type, }) {
    if ((0, conversation_lane_policy_helper_1.requiresAssignedRiderConversationType)(type) && !hasAssignedRider(order)) {
        return false;
    }
    if ((0, conversation_lane_policy_helper_1.isOperationsConversationType)(type)) {
        switch (type) {
            case client_1.ConversationType.CUSTOMER_OPERATIONS:
                return (isCustomerOwner(currentUser, order) || isOperationsActor(currentUser));
            case client_1.ConversationType.MERCHANT_OPERATIONS:
                return (isMerchantOwner(currentUser, order) || isOperationsActor(currentUser));
            case client_1.ConversationType.RIDER_OPERATIONS:
                return (isAssignedRider(currentUser, order) || isOperationsActor(currentUser));
            default:
                return false;
        }
    }
    switch (type) {
        case client_1.ConversationType.ORDER_CHAT:
            return (isCustomerOwner(currentUser, order) ||
                isMerchantOwner(currentUser, order) ||
                isAssignedRider(currentUser, order) ||
                isOperationsActor(currentUser));
        case client_1.ConversationType.CUSTOMER_MERCHANT:
            return (isCustomerOwner(currentUser, order) || isMerchantOwner(currentUser, order));
        case client_1.ConversationType.CUSTOMER_RIDER:
            return ((isCustomerOwner(currentUser, order) || isAssignedRider(currentUser, order)));
        case client_1.ConversationType.MERCHANT_RIDER:
            return ((isMerchantOwner(currentUser, order) || isAssignedRider(currentUser, order)));
        default:
            return false;
    }
}
function buildConversationParticipants({ currentUser, order, type, }) {
    const participants = [];
    if ((0, conversation_lane_policy_helper_1.requiresAssignedRiderConversationType)(type) && order.rider === null) {
        return null;
    }
    switch (type) {
        case client_1.ConversationType.ORDER_CHAT:
            participants.push(buildUserParticipant(order.customer.userId, client_1.ConversationParticipantRole.CUSTOMER), buildUserParticipant(order.merchant.userId, client_1.ConversationParticipantRole.MERCHANT));
            if ((0, conversation_lane_policy_helper_1.includesSystemParticipant)(type)) {
                participants.push(buildSystemParticipant('system:order-chat'));
            }
            if (order.rider !== null) {
                participants.push(buildUserParticipant(order.rider.userId, client_1.ConversationParticipantRole.RIDER, {
                    canSendProofs: true,
                }));
            }
            if (isOperationsActor(currentUser)) {
                participants.push(buildUserParticipant(currentUser.userId, toParticipantRole(currentUser.role), {
                    canModerate: true,
                }));
            }
            break;
        case client_1.ConversationType.CUSTOMER_MERCHANT:
            participants.push(buildUserParticipant(order.customer.userId, client_1.ConversationParticipantRole.CUSTOMER), buildUserParticipant(order.merchant.userId, client_1.ConversationParticipantRole.MERCHANT));
            break;
        case client_1.ConversationType.CUSTOMER_RIDER:
            if (order.rider === null) {
                return null;
            }
            participants.push(buildUserParticipant(order.customer.userId, client_1.ConversationParticipantRole.CUSTOMER), buildUserParticipant(order.rider.userId, client_1.ConversationParticipantRole.RIDER, {
                canSendProofs: true,
            }));
            break;
        case client_1.ConversationType.MERCHANT_RIDER:
            if (order.rider === null) {
                return null;
            }
            participants.push(buildUserParticipant(order.merchant.userId, client_1.ConversationParticipantRole.MERCHANT, {
                canSendProofs: true,
            }), buildUserParticipant(order.rider.userId, client_1.ConversationParticipantRole.RIDER, {
                canSendProofs: true,
            }));
            break;
        case client_1.ConversationType.CUSTOMER_OPERATIONS:
            participants.push(buildUserParticipant(order.customer.userId, client_1.ConversationParticipantRole.CUSTOMER));
            if (isOperationsActor(currentUser)) {
                participants.push(buildUserParticipant(currentUser.userId, toParticipantRole(currentUser.role), {
                    canModerate: true,
                }));
            }
            break;
        case client_1.ConversationType.MERCHANT_OPERATIONS:
            participants.push(buildUserParticipant(order.merchant.userId, client_1.ConversationParticipantRole.MERCHANT));
            if (isOperationsActor(currentUser)) {
                participants.push(buildUserParticipant(currentUser.userId, toParticipantRole(currentUser.role), {
                    canModerate: true,
                }));
            }
            break;
        case client_1.ConversationType.RIDER_OPERATIONS:
            if (order.rider === null) {
                return null;
            }
            participants.push(buildUserParticipant(order.rider.userId, client_1.ConversationParticipantRole.RIDER, {
                canSendProofs: true,
            }));
            if (isOperationsActor(currentUser)) {
                participants.push(buildUserParticipant(currentUser.userId, toParticipantRole(currentUser.role), {
                    canModerate: true,
                }));
            }
            break;
        default:
            return null;
    }
    return dedupeParticipants(participants);
}
function buildConversationTitle(order, type) {
    return `${order.orderCode} ${type.toLowerCase()}`;
}
function isCustomerOwner(currentUser, order) {
    return (currentUser.role === client_1.UserRole.CUSTOMER &&
        currentUser.userId === order.customer.userId &&
        currentUser.actorContext.customerProfileId === order.customer.customerProfileId);
}
function isMerchantOwner(currentUser, order) {
    return (currentUser.role === client_1.UserRole.MERCHANT &&
        currentUser.userId === order.merchant.userId &&
        currentUser.actorContext.merchantId === order.merchant.merchantId);
}
function isAssignedRider(currentUser, order) {
    return (order.rider !== null &&
        currentUser.role === client_1.UserRole.RIDER &&
        currentUser.userId === order.rider.userId &&
        currentUser.actorContext.riderId === order.rider.riderId);
}
function hasAssignedRider(order) {
    return order.rider !== null;
}
function isOperationsActor(currentUser) {
    return (currentUser.role === client_1.UserRole.ADMIN || currentUser.role === client_1.UserRole.SUPPORT);
}
function toParticipantRole(role) {
    switch (role) {
        case client_1.UserRole.ADMIN:
            return client_1.ConversationParticipantRole.ADMIN;
        case client_1.UserRole.SUPPORT:
            return client_1.ConversationParticipantRole.SUPPORT;
        case client_1.UserRole.CUSTOMER:
            return client_1.ConversationParticipantRole.CUSTOMER;
        case client_1.UserRole.MERCHANT:
            return client_1.ConversationParticipantRole.MERCHANT;
        case client_1.UserRole.RIDER:
            return client_1.ConversationParticipantRole.RIDER;
        default:
            return client_1.ConversationParticipantRole.SYSTEM;
    }
}
function buildUserParticipant(userId, roleAtJoin, overrides) {
    return {
        participantKey: `user:${userId}`,
        userId,
        roleAtJoin,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: roleAtJoin === client_1.ConversationParticipantRole.MERCHANT ||
            roleAtJoin === client_1.ConversationParticipantRole.RIDER,
        canModerate: roleAtJoin === client_1.ConversationParticipantRole.ADMIN ||
            roleAtJoin === client_1.ConversationParticipantRole.SUPPORT,
        ...overrides,
    };
}
function buildSystemParticipant(participantKey) {
    return {
        participantKey,
        userId: null,
        roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
        canSendMessages: false,
        canSendAttachments: false,
        canSendProofs: false,
        canModerate: false,
    };
}
function dedupeParticipants(participants) {
    const entries = new Map();
    for (const participant of participants) {
        entries.set(participant.participantKey, participant);
    }
    return [...entries.values()];
}
//# sourceMappingURL=conversation-resolution-policy.helper.js.map