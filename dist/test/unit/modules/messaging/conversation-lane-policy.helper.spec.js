"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const conversation_lane_policy_helper_1 = require("../../../../src/modules/messaging/policies/conversation-lane-policy.helper");
describe('conversation lane policy helper', () => {
    it('identifies rider-dependent lanes correctly', () => {
        expect((0, conversation_lane_policy_helper_1.requiresAssignedRiderConversationType)(client_1.ConversationType.ORDER_CHAT)).toBe(true);
        expect((0, conversation_lane_policy_helper_1.requiresAssignedRiderConversationType)(client_1.ConversationType.CUSTOMER_MERCHANT)).toBe(false);
        expect((0, conversation_lane_policy_helper_1.requiresAssignedRiderConversationType)(client_1.ConversationType.RIDER_OPERATIONS)).toBe(true);
    });
    it('identifies operations lanes and system-participant lanes', () => {
        expect((0, conversation_lane_policy_helper_1.isOperationsConversationType)(client_1.ConversationType.MERCHANT_OPERATIONS)).toBe(true);
        expect((0, conversation_lane_policy_helper_1.isOperationsConversationType)(client_1.ConversationType.MERCHANT_RIDER)).toBe(false);
        expect((0, conversation_lane_policy_helper_1.includesSystemParticipant)(client_1.ConversationType.ORDER_CHAT)).toBe(true);
        expect((0, conversation_lane_policy_helper_1.includesSystemParticipant)(client_1.ConversationType.CUSTOMER_OPERATIONS)).toBe(false);
    });
});
//# sourceMappingURL=conversation-lane-policy.helper.spec.js.map