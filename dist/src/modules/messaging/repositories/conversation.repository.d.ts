import { ConversationType } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import { ConversationSummaryRecord } from '../entities/conversation-summary.entity';
import { ConversationParticipantSpec } from '../policies/conversation-resolution-policy.helper';
type ResolveConversationInput = {
    orderId: string;
    type: ConversationType;
    title: string;
    participants: ConversationParticipantSpec[];
};
export declare class ConversationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOrderContextById(orderId: string): Promise<ConversationOrderContextEntity | null>;
    resolve(payload: ResolveConversationInput): Promise<ResolvedConversationEntity>;
    findResolvedById(conversationId: string): Promise<ResolvedConversationEntity | null>;
    listConversationSummaryRecordsForUser(userId: string, limit?: number, orderId?: string): Promise<ConversationSummaryRecord[]>;
    findConversationSummaryRecordById(conversationId: string): Promise<ConversationSummaryRecord | null>;
}
export {};
