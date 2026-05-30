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
exports.ConversationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const conversation_order_context_entity_1 = require("../entities/conversation-order-context.entity");
const resolved_conversation_entity_1 = require("../entities/resolved-conversation.entity");
const conversation_summary_entity_1 = require("../entities/conversation-summary.entity");
let ConversationRepository = class ConversationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrderContextById(orderId) {
        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: conversation_order_context_entity_1.conversationOrderContextSelect,
        });
        return order === null ? null : (0, conversation_order_context_entity_1.buildConversationOrderContext)(order);
    }
    async resolve(payload) {
        const conversation = await this.prisma.$transaction(async (tx) => {
            const conversationRecord = await tx.conversation.upsert({
                where: {
                    orderId_type: {
                        orderId: payload.orderId,
                        type: payload.type,
                    },
                },
                create: {
                    orderId: payload.orderId,
                    type: payload.type,
                    title: payload.title,
                },
                update: {
                    title: payload.title,
                },
            });
            for (const participant of payload.participants) {
                await tx.conversationParticipant.upsert({
                    where: {
                        conversationId_participantKey: {
                            conversationId: conversationRecord.id,
                            participantKey: participant.participantKey,
                        },
                    },
                    create: {
                        conversationId: conversationRecord.id,
                        participantKey: participant.participantKey,
                        userId: participant.userId ?? null,
                        roleAtJoin: participant.roleAtJoin,
                        canSendMessages: participant.canSendMessages,
                        canSendAttachments: participant.canSendAttachments,
                        canSendProofs: participant.canSendProofs,
                        canModerate: participant.canModerate,
                        leftAt: null,
                    },
                    update: {
                        userId: participant.userId ?? null,
                        roleAtJoin: participant.roleAtJoin,
                        canSendMessages: participant.canSendMessages,
                        canSendAttachments: participant.canSendAttachments,
                        canSendProofs: participant.canSendProofs,
                        canModerate: participant.canModerate,
                        leftAt: null,
                    },
                });
            }
            return tx.conversation.findUniqueOrThrow({
                where: {
                    id: conversationRecord.id,
                },
                include: resolved_conversation_entity_1.resolvedConversationInclude,
            });
        });
        return (0, resolved_conversation_entity_1.buildResolvedConversation)(conversation);
    }
    async findResolvedById(conversationId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: resolved_conversation_entity_1.resolvedConversationInclude,
        });
        return conversation === null ? null : (0, resolved_conversation_entity_1.buildResolvedConversation)(conversation);
    }
    listConversationSummaryRecordsForUser(userId, limit = 20, orderId) {
        return this.prisma.conversation.findMany({
            where: {
                orderId,
                participants: {
                    some: {
                        userId,
                        leftAt: null,
                    },
                },
            },
            include: conversation_summary_entity_1.conversationSummaryInclude,
            orderBy: [
                {
                    lastMessageAt: 'desc',
                },
                {
                    updatedAt: 'desc',
                },
                {
                    id: 'desc',
                },
            ],
            take: limit,
        });
    }
    findConversationSummaryRecordById(conversationId) {
        return this.prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: conversation_summary_entity_1.conversationSummaryInclude,
        });
    }
};
exports.ConversationRepository = ConversationRepository;
exports.ConversationRepository = ConversationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationRepository);
//# sourceMappingURL=conversation.repository.js.map