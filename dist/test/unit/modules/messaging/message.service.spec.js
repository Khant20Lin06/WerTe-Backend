"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const send_message_dto_1 = require("../../../../src/modules/messaging/dto/send-message.dto");
const message_service_1 = require("../../../../src/modules/messaging/services/message.service");
const send_message_attachment_dto_1 = require("../../../../src/modules/messaging/dto/send-message-attachment.dto");
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
                participantKey: 'system:order-chat',
                userId: null,
                roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
                canSendMessages: false,
                canSendAttachments: false,
                canSendProofs: false,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
        ],
        ...overrides,
    };
}
function makeSentMessage(overrides) {
    return {
        messageId: 'msg_1',
        conversationId: 'con_1',
        senderKind: 'USER',
        senderId: 'usr_customer_1',
        type: client_1.MessageType.TEXT,
        systemEventCode: null,
        body: 'Heading out now.',
        metadataJson: null,
        deletedAt: null,
        createdAt: '2026-04-19T10:00:00.000Z',
        receipts: [
            {
                userId: 'usr_customer_1',
                status: client_1.MessageDeliveryStatus.READ,
                deliveredAt: '2026-04-19T10:00:00.000Z',
                readAt: '2026-04-19T10:00:00.000Z',
            },
            {
                userId: 'usr_merchant_1',
                status: client_1.MessageDeliveryStatus.DELIVERED,
                deliveredAt: '2026-04-19T10:00:00.000Z',
                readAt: null,
            },
        ],
        attachments: [],
        ...overrides,
    };
}
describe('MessageService', () => {
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
    it('derives sender from the authenticated actor and persists receipts for active user participants', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
            findOrderContextById: jest.fn().mockResolvedValue(null),
        };
        const messageRepository = {
            create: jest.fn().mockResolvedValue(makeSentMessage()),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            canSendMessage: jest.fn().mockReturnValue(true),
            canSendAttachment: jest.fn().mockReturnValue(true),
        };
        const messageDeliveryService = {
            emitMessageCreated: jest.fn(),
            emitConversationUpdated: jest.fn(),
            queuePushFallback: jest.fn().mockResolvedValue(undefined),
        };
        const notificationEventService = {
            publishConversationMessage: jest.fn().mockResolvedValue(undefined),
        };
        const auditEventService = {
            publishConversationMessage: jest.fn().mockResolvedValue(undefined),
        };
        const service = new message_service_1.MessageService(conversationRepository, messageRepository, messagingPolicyService, messageDeliveryService, notificationEventService, auditEventService);
        const result = await service.send(currentUser, {
            conversationId: 'con_1',
            body: 'Heading out now.',
        });
        expect(messageRepository.create).toHaveBeenCalledWith({
            conversationId: 'con_1',
            senderKind: 'USER',
            senderId: 'usr_customer_1',
            type: client_1.MessageType.TEXT,
            body: 'Heading out now.',
            attachments: [],
            receiptUserIds: ['usr_customer_1', 'usr_merchant_1'],
        });
        expect(messageDeliveryService.queuePushFallback).toHaveBeenCalledWith('con_1');
        expect(notificationEventService.publishConversationMessage).toHaveBeenCalled();
        expect(auditEventService.publishConversationMessage).toHaveBeenCalled();
        expect(result).toMatchObject({
            messageId: 'msg_1',
            senderId: 'usr_customer_1',
        });
    });
    it('rejects proof messages when the actor lacks proof permission', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            canSendMessage: jest.fn().mockReturnValue(false),
        };
        const service = new message_service_1.MessageService(conversationRepository, {}, messagingPolicyService, {}, {}, {});
        await expect(service.send(currentUser, {
            conversationId: 'con_1',
            type: send_message_dto_1.SendMessageTypeValue.proofOfDelivery,
            attachments: [
                {
                    type: send_message_attachment_dto_1.SendMessageAttachmentTypeValue.proofOfDelivery,
                    storageKey: 'proofs/order_1/proof_1.jpg',
                },
            ],
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('rejects image/proof payloads when attachment types do not match the selected message type', async () => {
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            canSendMessage: jest.fn().mockReturnValue(true),
            canSendAttachment: jest.fn().mockReturnValue(true),
        };
        const service = new message_service_1.MessageService(conversationRepository, {}, messagingPolicyService, {}, {}, {});
        await expect(service.send(currentUser, {
            conversationId: 'con_1',
            type: send_message_dto_1.SendMessageTypeValue.image,
            attachments: [
                {
                    type: send_message_attachment_dto_1.SendMessageAttachmentTypeValue.file,
                    storageKey: 'files/order_1/file_1.pdf',
                },
            ],
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('maps proof attachment visibility for merchant/rider proof payloads', async () => {
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
        const conversationRepository = {
            findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
            findOrderContextById: jest.fn().mockResolvedValue(null),
        };
        const messageRepository = {
            create: jest.fn().mockResolvedValue(makeSentMessage({
                type: client_1.MessageType.PROOF_OF_HANDOFF,
                attachments: [
                    {
                        type: client_1.MessageAttachmentType.PROOF_OF_HANDOFF,
                        visibility: client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
                        storageKey: 'proofs/order_1/handoff_1.jpg',
                        fileName: 'handoff.jpg',
                        mimeType: 'image/jpeg',
                        fileSizeBytes: 1024,
                        width: 1200,
                        height: 900,
                        createdAt: '2026-04-19T10:00:00.000Z',
                    },
                ],
            })),
        };
        const messagingPolicyService = {
            canAccessConversation: jest.fn().mockReturnValue(true),
            canSendMessage: jest.fn().mockReturnValue(true),
            canSendAttachment: jest.fn().mockReturnValue(true),
        };
        const service = new message_service_1.MessageService(conversationRepository, messageRepository, messagingPolicyService, {
            emitMessageCreated: jest.fn(),
            emitConversationUpdated: jest.fn(),
            queuePushFallback: jest.fn().mockResolvedValue(undefined),
        }, {
            publishConversationMessage: jest.fn().mockResolvedValue(undefined),
        }, {
            publishConversationMessage: jest.fn().mockResolvedValue(undefined),
        });
        await service.send(merchantUser, {
            conversationId: 'con_1',
            type: send_message_dto_1.SendMessageTypeValue.proofOfHandoff,
            attachments: [
                {
                    type: send_message_attachment_dto_1.SendMessageAttachmentTypeValue.proofOfHandoff,
                    storageKey: 'proofs/order_1/handoff_1.jpg',
                    fileName: 'handoff.jpg',
                },
            ],
        });
        expect(messageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            attachments: [
                expect.objectContaining({
                    type: client_1.MessageAttachmentType.PROOF_OF_HANDOFF,
                    visibility: client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
                }),
            ],
        }));
    });
});
//# sourceMappingURL=message.service.spec.js.map