"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const conversation_message_list_entity_1 = require("../entities/conversation-message-list.entity");
const sent_message_entity_1 = require("../entities/sent-message.entity");
let MessageRepository = class MessageRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMessageReadContextById(messageId) {
        return this.prisma.message.findUnique({
            where: {
                id: messageId,
            },
            select: {
                id: true,
                conversationId: true,
            },
        });
    }
    async create(payload) {
        const message = await this.prisma.$transaction(async (tx) => {
            const createdMessage = await tx.message.create({
                data: {
                    conversationId: payload.conversationId,
                    senderKind: payload.senderKind,
                    senderId: payload.senderId ?? null,
                    type: payload.type,
                    systemEventCode: payload.systemEventCode ?? null,
                    body: payload.body,
                    metadataJson: payload.metadataJson,
                    attachments: {
                        create: payload.attachments.map((attachment) => ({
                            type: attachment.type,
                            visibility: attachment.visibility,
                            storageKey: attachment.storageKey,
                            fileName: attachment.fileName,
                            mimeType: attachment.mimeType,
                            fileSizeBytes: attachment.fileSizeBytes,
                            width: attachment.width,
                            height: attachment.height,
                        })),
                    },
                    receipts: {
                        create: payload.receiptUserIds.map((userId) => ({
                            userId,
                            status: payload.senderId != null && userId === payload.senderId
                                ? client_1.MessageDeliveryStatus.READ
                                : client_1.MessageDeliveryStatus.DELIVERED,
                            deliveredAt: new Date(),
                            readAt: payload.senderId != null && userId === payload.senderId
                                ? new Date()
                                : null,
                        })),
                    },
                },
                include: sent_message_entity_1.sentMessageInclude,
            });
            await tx.conversation.update({
                where: {
                    id: payload.conversationId,
                },
                data: {
                    lastMessageId: createdMessage.id,
                    lastMessageAt: createdMessage.createdAt,
                },
            });
            return createdMessage;
        });
        return (0, sent_message_entity_1.buildSentMessage)(message);
    }
    createSystemEvent(payload) {
        return this.create({
            conversationId: payload.conversationId,
            senderKind: 'SYSTEM',
            senderId: null,
            type: client_1.MessageType.SYSTEM_EVENT,
            systemEventCode: payload.systemEventCode,
            body: payload.body,
            metadataJson: payload.metadataJson,
            attachments: [],
            receiptUserIds: payload.receiptUserIds,
        });
    }
    async countUnreadByConversationIds(userId, conversationIds) {
        if (conversationIds.length === 0) {
            return {};
        }
        const receipts = await this.prisma.messageReceipt.findMany({
            where: {
                userId,
                status: {
                    not: client_1.MessageDeliveryStatus.READ,
                },
                message: {
                    conversationId: {
                        in: conversationIds,
                    },
                },
            },
            select: {
                message: {
                    select: {
                        conversationId: true,
                    },
                },
            },
        });
        return receipts.reduce((counts, receipt) => {
            const conversationId = receipt.message.conversationId;
            counts[conversationId] = (counts[conversationId] ?? 0) + 1;
            return counts;
        }, {});
    }
    async listConversationMessages(conversationId, input) {
        const limit = Math.min(Math.max(input?.limit ?? 20, 1), 100);
        const messages = await this.prisma.message.findMany({
            where: {
                conversationId,
            },
            select: conversation_message_list_entity_1.conversationMessageSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            cursor: input?.cursor === undefined
                ? undefined
                : {
                    id: input.cursor,
                },
            skip: input?.cursor === undefined ? 0 : 1,
            take: limit + 1,
        });
        const hasMore = messages.length > limit;
        const slice = hasMore ? messages.slice(0, limit) : messages;
        const ordered = [...slice].reverse();
        return {
            records: ordered,
            nextCursor: hasMore ? ordered[0]?.id ?? null : null,
            hasMore,
        };
    }
    async markConversationReadUpTo(input) {
        const readAt = new Date();
        return this.prisma.$transaction(async (tx) => {
            const orderedMessages = await tx.message.findMany({
                where: {
                    conversationId: input.conversationId,
                },
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                },
            });
            const targetIndex = orderedMessages.findIndex((message) => message.id === input.targetMessageId);
            if (targetIndex === -1) {
                return {
                    conversationId: input.conversationId,
                    messageId: input.targetMessageId,
                    readAt: readAt.toISOString(),
                };
            }
            const messageIds = orderedMessages
                .slice(0, targetIndex + 1)
                .map((message) => message.id);
            await tx.messageReceipt.updateMany({
                where: {
                    userId: input.userId,
                    messageId: {
                        in: messageIds,
                    },
                    status: {
                        not: client_1.MessageDeliveryStatus.READ,
                    },
                },
                data: {
                    status: client_1.MessageDeliveryStatus.READ,
                    readAt,
                },
            });
            await tx.conversationParticipant.updateMany({
                where: {
                    conversationId: input.conversationId,
                    userId: input.userId,
                    leftAt: null,
                },
                data: {
                    lastReadMessageId: input.targetMessageId,
                    lastReadAt: readAt,
                },
            });
            return {
                conversationId: input.conversationId,
                messageId: input.targetMessageId,
                readAt: readAt.toISOString(),
            };
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessageRepository);
//# sourceMappingURL=message.repository.js.map