"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const message_read_service_1 = require("../../../../src/modules/messaging/services/message-read.service");
function makeResolvedConversation(overrides) {
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
function makeMessageRecord(overrides) {
    return {
        id: 'msg_1',
        conversationId: 'con_1',
        senderKind: 'USER',
        senderId: 'usr_merchant_1',
        type: client_1.MessageType.PROOF_OF_HANDOFF,
        systemEventCode: null,
        body: 'Please check this handoff photo.',
        metadataJson: null,
        deletedAt: null,
        createdAt: new Date('2026-04-20T10:05:00.000Z'),
        sender: {
            id: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            customerProfile: null,
            riderProfile: null,
            merchantProfile: {
                name: 'Demo Merchant',
            },
        },
        attachments: [
            {
                type: 'PROOF_OF_HANDOFF',
                visibility: client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
                storageKey: 'proofs/order_1/handoff_1.jpg',
                fileName: 'handoff.jpg',
                mimeType: 'image/jpeg',
                fileSizeBytes: 1024,
                width: 1200,
                height: 900,
                createdAt: new Date('2026-04-20T10:05:00.000Z'),
            },
        ],
        receipts: [
            {
                userId: 'usr_customer_1',
                status: client_1.MessageDeliveryStatus.DELIVERED,
                deliveredAt: new Date('2026-04-20T10:05:00.000Z'),
                readAt: null,
            },
        ],
        ...overrides,
    };
}
describe('MessageReadService', () => {
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
    it('filters attachment visibility based on the viewer participant role', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messageRepository = {
            listConversationMessages: jest.fn().mockResolvedValue({
                records: [makeMessageRecord()],
                nextCursor: null,
                hasMore: false,
            }),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            findActiveParticipant: jest.fn().mockReturnValue(makeResolvedConversation().participants[0]),
        };
        const service = new message_read_service_1.MessageReadService(conversationRepository, messageRepository, messagingPolicyService);
        const result = await service.listCurrentUserConversationMessages(currentUser, {
            conversationId: 'con_1',
        });
        expect(result).toMatchObject({
            conversationId: 'con_1',
            hasMore: false,
            messages: [
                {
                    messageId: 'msg_1',
                    senderDisplayName: 'Demo Merchant',
                    attachments: [],
                },
            ],
        });
    });
    it('preserves system events and pagination cursors for readable message pages', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messageRepository = {
            listConversationMessages: jest.fn().mockResolvedValue({
                records: [
                    makeMessageRecord({
                        id: 'msg_2',
                        senderKind: 'SYSTEM',
                        senderId: null,
                        type: client_1.MessageType.SYSTEM_EVENT,
                        systemEventCode: client_1.SystemMessageCode.ORDER_PICKED_UP,
                        body: 'Ko Aung picked up the order.',
                        sender: null,
                        attachments: [],
                    }),
                ],
                nextCursor: 'msg_2',
                hasMore: true,
            }),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            findActiveParticipant: jest.fn().mockReturnValue(makeResolvedConversation({
                participants: [
                    {
                        participantKey: 'user:usr_merchant_1',
                        userId: 'usr_merchant_1',
                        roleAtJoin: client_1.ConversationParticipantRole.MERCHANT,
                        canSendMessages: true,
                        canSendAttachments: true,
                        canSendProofs: true,
                        canModerate: false,
                        lastReadMessageId: null,
                        lastReadAt: null,
                        joinedAt: '2026-04-20T10:00:00.000Z',
                        leftAt: null,
                    },
                ],
            }).participants[0]),
        };
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
        const service = new message_read_service_1.MessageReadService(conversationRepository, messageRepository, messagingPolicyService);
        const result = await service.listCurrentUserConversationMessages(merchantUser, {
            conversationId: 'con_1',
            cursor: 'msg_10',
            limit: 10,
        });
        expect(result).toMatchObject({
            conversationId: 'con_1',
            nextCursor: 'msg_2',
            hasMore: true,
            messages: [
                {
                    messageId: 'msg_2',
                    senderKind: 'SYSTEM',
                    senderDisplayName: 'System',
                    systemEventCode: client_1.SystemMessageCode.ORDER_PICKED_UP,
                },
            ],
        });
    });
    it('returns proof attachments to merchant viewers that are allowed to see them', async () => {
        const merchantConversation = makeResolvedConversation({
            participants: [
                {
                    participantKey: 'user:usr_merchant_1',
                    userId: 'usr_merchant_1',
                    roleAtJoin: client_1.ConversationParticipantRole.MERCHANT,
                    canSendMessages: true,
                    canSendAttachments: true,
                    canSendProofs: true,
                    canModerate: false,
                    lastReadMessageId: null,
                    lastReadAt: null,
                    joinedAt: '2026-04-20T10:00:00.000Z',
                    leftAt: null,
                },
            ],
        });
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(merchantConversation),
        };
        const messageRepository = {
            listConversationMessages: jest.fn().mockResolvedValue({
                records: [makeMessageRecord()],
                nextCursor: null,
                hasMore: false,
            }),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            findActiveParticipant: jest.fn().mockReturnValue(merchantConversation.participants[0]),
        };
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
        const service = new message_read_service_1.MessageReadService(conversationRepository, messageRepository, messagingPolicyService);
        const result = await service.listCurrentUserConversationMessages(merchantUser, {
            conversationId: 'con_1',
        });
        expect(result.messages[0]?.attachments).toEqual(expect.arrayContaining([
            expect.objectContaining({
                storageKey: 'proofs/order_1/handoff_1.jpg',
                visibility: client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
            }),
        ]));
    });
    it('rejects reads when the actor is not an active conversation participant', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            findActiveParticipant: jest.fn().mockReturnValue(null),
        };
        const service = new message_read_service_1.MessageReadService(conversationRepository, {}, messagingPolicyService);
        await expect(service.listCurrentUserConversationMessages(currentUser, {
            conversationId: 'con_1',
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
});
//# sourceMappingURL=message-read.service.spec.js.map