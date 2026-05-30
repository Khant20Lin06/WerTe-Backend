import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationSummaryEntity } from '../entities/conversation-summary.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessagingPolicyService } from './message-policy.service';
export declare class ConversationReadService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly messagingPolicyService;
    constructor(conversationRepository: ConversationRepository, messageRepository: MessageRepository, messagingPolicyService: MessagingPolicyService);
    listCurrentUserConversations(currentUser: AuthenticatedUserEntity, limit?: number, orderId?: string): Promise<ConversationSummaryEntity[]>;
    listCurrentUserOrderConversations(currentUser: AuthenticatedUserEntity, orderId: string, limit?: number): Promise<ConversationSummaryEntity[]>;
    getCurrentUserConversation(currentUser: AuthenticatedUserEntity, conversationId: string): Promise<ConversationSummaryEntity>;
}
