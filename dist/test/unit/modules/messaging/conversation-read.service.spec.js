"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const conversation_read_service_1 = require("../../../../src/modules/messaging/services/conversation-read.service");
function makeConversationSummaryRecord(overrides) {
    return {
        id: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'ORD-00000001 order_chat',
        lastMessageId: 'msg_1',
        lastMessageAt: new Date('2026-04-20T10:05:00.000Z'),
        createdAt: new Date('2026-04-20T10:00:00.000Z'),
        updatedAt: new Date('2026-04-20T10:05:00.000Z'),
        order: {
            orderCode: 'ORD-00000001',
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        },
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
                leftAt: null,
            },
        ],
        lastMessage: {
            id: 'msg_1',
            senderKind: 'SYSTEM',
            senderId: null,
            type: client_1.MessageType.SYSTEM_EVENT,
            systemEventCode: client_1.SystemMessageCode.RIDER_ASSIGNED,
            body: 'Ko Aung was assigned to deliver the order.',
            createdAt: new Date('2026-04-20T10:05:00.000Z'),
            attachments: [],
        },
        ...overrides,
    };
}
function makeResolvedConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'ORD-00000001 order_chat',
        lastMessageId: 'msg_1',
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
describe('ConversationReadService', () => {
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
    it('lists current user conversations with unread counts', async () => {
        const conversationRepository = {
            listConversationSummaryRecordsForUser: jest
                .fn()
                .mockResolvedValue([makeConversationSummaryRecord()]),
        };
        const messageRepository = {
            countUnreadByConversationIds: jest.fn().mockResolvedValue({
                con_1: 3,
            }),
        };
        const service = new conversation_read_service_1.ConversationReadService(conversationRepository, messageRepository, {});
        const result = await service.listCurrentUserConversations(currentUser);
        expect(result).toMatchObject([
            {
                conversationId: 'con_1',
                unreadCount: 3,
                preview: {
                    messageId: 'msg_1',
                    systemEventCode: client_1.SystemMessageCode.RIDER_ASSIGNED,
                },
            },
        ]);
    });
    it('passes order-scoped filters through when listing order conversations', async () => {
        const conversationRepository = {
            listConversationSummaryRecordsForUser: jest
                .fn()
                .mockResolvedValue([makeConversationSummaryRecord()]),
        };
        const messageRepository = {
            countUnreadByConversationIds: jest.fn().mockResolvedValue({
                con_1: 1,
            }),
        };
        const service = new conversation_read_service_1.ConversationReadService(conversationRepository, messageRepository, {});
        await service.listCurrentUserOrderConversations(currentUser, 'order_1', 15);
        expect(conversationRepository.listConversationSummaryRecordsForUser).toHaveBeenCalledWith('usr_customer_1', 15, 'order_1');
    });
    it('rejects conversation detail reads when the actor lacks access', async () => {
        const conversationRepository = {
            findConversationSummaryRecordById: jest
                .fn()
                .mockResolvedValue(makeConversationSummaryRecord()),
            findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(false),
        };
        const service = new conversation_read_service_1.ConversationReadService(conversationRepository, {}, messagingPolicyService);
        await expect(service.getCurrentUserConversation(currentUser, 'con_1')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
});
//# sourceMappingURL=conversation-read.service.spec.js.map