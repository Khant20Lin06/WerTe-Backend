import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListConversationMessagesQueryDto } from '../dto/list-conversation-messages-query.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';
import { ResolveConversationDto } from '../dto/resolve-conversation.dto';
import { SendConversationMessageDto } from '../dto/send-conversation-message.dto';
import { ConversationMessageListEntity } from '../entities/conversation-message-list.entity';
import { ConversationSummaryEntity } from '../entities/conversation-summary.entity';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
import { MessagingRestService } from '../services/messaging-rest.service';
export declare class SupportMessagingController {
    private readonly messagingRestService;
    constructor(messagingRestService: MessagingRestService);
    listConversations(currentUser: AuthenticatedUserEntity, query: ListConversationsQueryDto): Promise<ConversationSummaryEntity[]>;
    listOrderConversations(currentUser: AuthenticatedUserEntity, orderId: string, query: ListConversationsQueryDto): Promise<ConversationSummaryEntity[]>;
    resolveConversation(currentUser: AuthenticatedUserEntity, orderId: string, body: ResolveConversationDto): Promise<ResolvedConversationEntity>;
    getConversation(currentUser: AuthenticatedUserEntity, conversationId: string): Promise<ConversationSummaryEntity>;
    listMessages(currentUser: AuthenticatedUserEntity, conversationId: string, query: ListConversationMessagesQueryDto): Promise<ConversationMessageListEntity>;
    sendMessage(currentUser: AuthenticatedUserEntity, conversationId: string, body: SendConversationMessageDto): Promise<SentMessageEntity>;
    markRead(currentUser: AuthenticatedUserEntity, messageId: string): Promise<MarkedMessageReadEntity>;
}
