"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const message_receipt_service_1 = require("../../../../src/modules/messaging/services/message-receipt.service");
function makeConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'ORD-00000001 order_chat',
        lastMessageId: 'msg_2',
        lastMessageAt: '2026-04-20T10:05:00.000Z',
        createdAt: '2026-04-20T10:00:00.000Z',
        updatedAt: '2026-04-20T10:05:00.000Z',
        participants: [
            {
                participantKey: 'user:usr_customer_1',
                userId: 'usr_customer_1',
                roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: false,
                canModerate: false,
                lastReadMessageId: null,
                lastReadAt: null,
                joinedAt: '2026-04-20T10:00:00.000Z',
                leftAt: null,
            },
        ],
        ...overrides,
    };
}
describe('MessageReceiptService', () => {
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
    it('marks the conversation read position for the authenticated actor', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
        };
        const messageRepository = {
            findMessageReadContextById: jest.fn().mockResolvedValue({
                id: 'msg_2',
                conversationId: 'con_1',
            }),
            markConversationReadUpTo: jest.fn().mockResolvedValue({
                conversationId: 'con_1',
                messageId: 'msg_2',
                readAt: '2026-04-20T10:06:00.000Z',
            }),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            findActiveParticipant: jest.fn().mockReturnValue(makeConversation().participants[0]),
        };
        const messageDeliveryService = {
            emitMessageRead: jest.fn(),
            emitConversationUpdated: jest.fn(),
        };
        const service = new message_receipt_service_1.MessageReceiptService(conversationRepository, messageRepository, messagingPolicyService, messageDeliveryService);
        const result = await service.markMessageRead(currentUser, 'msg_2');
        expect(messageRepository.markConversationReadUpTo).toHaveBeenCalledWith({
            conversationId: 'con_1',
            targetMessageId: 'msg_2',
            userId: 'usr_customer_1',
        });
        expect(result).toMatchObject({
            conversationId: 'con_1',
            messageId: 'msg_2',
        });
        expect(messageDeliveryService.emitMessageRead).toHaveBeenCalledWith({
            conversationId: 'con_1',
            messageId: 'msg_2',
            readAt: '2026-04-20T10:06:00.000Z',
        });
        expect(messageDeliveryService.emitConversationUpdated).toHaveBeenCalledWith('con_1');
    });
    it('rejects mark-read requests when the actor cannot access the conversation', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
        };
        const messageRepository = {
            findMessageReadContextById: jest.fn().mockResolvedValue({
                id: 'msg_2',
                conversationId: 'con_1',
            }),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(false),
        };
        const service = new message_receipt_service_1.MessageReceiptService(conversationRepository, messageRepository, messagingPolicyService, {});
        await expect(service.markMessageRead(currentUser, 'msg_2')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
});
//# sourceMappingURL=message-receipt.service.spec.js.map