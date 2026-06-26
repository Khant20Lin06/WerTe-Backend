"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const message_policy_service_1 = require("../../../../src/modules/messaging/services/message-policy.service");
function makeConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.MERCHANT_RIDER,
        title: 'ORD-00000001 merchant_rider',
        lastMessageId: null,
        lastMessageAt: null,
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
        participants: [
            {
                participantKey: 'user:usr_rider_1',
                userId: 'usr_rider_1',
                roleAtJoin: client_1.ConversationParticipantRole.RIDER,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: true,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
            {
                participantKey: 'user:usr_support_1',
                userId: 'usr_support_1',
                roleAtJoin: client_1.ConversationParticipantRole.SUPPORT,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: false,
                canModerate: true,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
        ],
        ...overrides,
    };
}
describe('MessagingPolicyService', () => {
    const service = new message_policy_service_1.MessagingPolicyService();
    it('returns the active participant for the actor', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_rider_1',
            role: client_1.UserRole.RIDER,
            actorContext: {
                userId: 'usr_rider_1',
                phone: '0999999999',
                role: client_1.UserRole.RIDER,
                status: client_1.UserStatus.ACTIVE,
                riderId: 'rider_1',
            },
        });
        expect(service.findActiveParticipant(currentUser, makeConversation())).toMatchObject({
            participantKey: 'user:usr_rider_1',
            roleAtJoin: client_1.ConversationParticipantRole.RIDER,
        });
    });
    it('applies proof and moderation permissions through the service facade', () => {
        const riderUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_rider_1',
            role: client_1.UserRole.RIDER,
            actorContext: {
                userId: 'usr_rider_1',
                phone: '0999999999',
                role: client_1.UserRole.RIDER,
                status: client_1.UserStatus.ACTIVE,
                riderId: 'rider_1',
            },
        });
        const supportUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_support_1',
            role: client_1.UserRole.SUPPORT,
            actorContext: {
                userId: 'usr_support_1',
                phone: '0991111111',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        const conversation = makeConversation();
        expect(service.canAccessConversation(riderUser, conversation)).toBe(true);
        expect(service.canSendMessage(riderUser, conversation, client_1.MessageType.PROOF_OF_DELIVERY)).toBe(true);
        expect(service.canSendAttachment(supportUser, conversation, client_1.MessageAttachmentType.PROOF_OF_DELIVERY)).toBe(false);
        expect(service.canModerateConversation(supportUser, conversation)).toBe(true);
    });
});
//# sourceMappingURL=message-policy.service.spec.js.map