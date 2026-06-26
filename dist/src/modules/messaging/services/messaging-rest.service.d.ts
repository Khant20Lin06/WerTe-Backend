import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MarkReadDto } from '../dto/mark-read.dto';
import { ListConversationMessagesQueryDto } from '../dto/list-conversation-messages-query.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';
import { ResolveConversationDto } from '../dto/resolve-conversation.dto';
import { SendConversationMessageDto } from '../dto/send-conversation-message.dto';
import { ConversationReadService } from './conversation-read.service';
import { ConversationService } from './conversation.service';
import { MessageReadService } from './message-read.service';
import { MessageReceiptService } from './message-receipt.service';
import { MessageService } from './message.service';
export declare class MessagingRestService {
    private readonly conversationService;
    private readonly conversationReadService;
    private readonly messageReadService;
    private readonly messageService;
    private readonly messageReceiptService;
    constructor(conversationService: ConversationService, conversationReadService: ConversationReadService, messageReadService: MessageReadService, messageService: MessageService, messageReceiptService: MessageReceiptService);
    listCurrentUserConversations(currentUser: AuthenticatedUserEntity, query: ListConversationsQueryDto): Promise<import("../entities/conversation-summary.entity").ConversationSummaryEntity[]>;
    listCurrentUserOrderConversations(currentUser: AuthenticatedUserEntity, orderId: string, query: ListConversationsQueryDto): Promise<import("../entities/conversation-summary.entity").ConversationSummaryEntity[]>;
    resolveCurrentUserConversationForOrder(currentUser: AuthenticatedUserEntity, orderId: string, body: ResolveConversationDto): Promise<import("../entities/resolved-conversation.entity").ResolvedConversationEntity>;
    getCurrentUserConversation(currentUser: AuthenticatedUserEntity, conversationId: string): Promise<import("../entities/conversation-summary.entity").ConversationSummaryEntity>;
    listCurrentUserConversationMessages(currentUser: AuthenticatedUserEntity, conversationId: string, query: ListConversationMessagesQueryDto): Promise<import("../entities/conversation-message-list.entity").ConversationMessageListEntity>;
    sendCurrentUserMessage(currentUser: AuthenticatedUserEntity, conversationId: string, body: SendConversationMessageDto): Promise<import("../entities/sent-message.entity").SentMessageEntity>;
    markCurrentUserMessageRead(currentUser: AuthenticatedUserEntity, messageId: string): Promise<MarkReadDto>;
}
