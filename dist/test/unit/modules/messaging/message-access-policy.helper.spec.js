"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const message_access_policy_helper_1 = require("../../../../src/modules/messaging/policies/message-access-policy.helper");
function makeConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'ORD-00000001 order_chat',
        lastMessageId: null,
        lastMessageAt: null,
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
        participants: [
            {
                participantKey: 'user:usr_customer_1',
                userId: 'usr_customer_1',
                roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: false,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
            {
                participantKey: 'user:usr_merchant_1',
                userId: 'usr_merchant_1',
                roleAtJoin: client_1.ConversationParticipantRole.MERCHANT,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: true,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
            {
                participantKey: 'user:usr_admin_1',
                userId: 'usr_admin_1',
                roleAtJoin: client_1.ConversationParticipantRole.ADMIN,
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
describe('message access policy helper', () => {
    it('returns the active participant record for the authenticated actor', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_customer_1',
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        expect((0, message_access_policy_helper_1.getActiveConversationParticipant)({
            currentUser,
            conversation: makeConversation(),
        })).toMatchObject({
            participantKey: 'user:usr_customer_1',
            roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
        });
    });
    it('allows proof sends only for participants with proof permission', () => {
        const merchantUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0942000000',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_1',
            },
        });
        const customerUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_customer_1',
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        const conversation = makeConversation();
        expect((0, message_access_policy_helper_1.canSendMessage)({
            currentUser: merchantUser,
            conversation,
            messageType: client_1.MessageType.PROOF_OF_HANDOFF,
        })).toBe(true);
        expect((0, message_access_policy_helper_1.canSendAttachment)({
            currentUser: merchantUser,
            conversation,
            attachmentType: client_1.MessageAttachmentType.PROOF_OF_HANDOFF,
        })).toBe(true);
        expect((0, message_access_policy_helper_1.canSendMessage)({
            currentUser: customerUser,
            conversation,
            messageType: client_1.MessageType.PROOF_OF_DELIVERY,
        })).toBe(false);
        expect((0, message_access_policy_helper_1.canSendAttachment)({
            currentUser: customerUser,
            conversation,
            attachmentType: client_1.MessageAttachmentType.PROOF_OF_DELIVERY,
        })).toBe(false);
    });
    it('allows moderation only for participants with moderate permission', () => {
        const adminUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '0991111111',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        const customerUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_customer_1',
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        const conversation = makeConversation();
        expect((0, message_access_policy_helper_1.canAccessConversation)({
            currentUser: adminUser,
            conversation,
        })).toBe(true);
        expect((0, message_access_policy_helper_1.canModerateConversation)({
            currentUser: adminUser,
            conversation,
        })).toBe(true);
        expect((0, message_access_policy_helper_1.canModerateConversation)({
            currentUser: customerUser,
            conversation,
        })).toBe(false);
    });
});
//# sourceMappingURL=message-access-policy.helper.spec.js.map