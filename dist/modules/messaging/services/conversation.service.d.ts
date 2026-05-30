import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { MessagePolicyService } from '../policies/message-policy.service';
import { ConversationRepository } from '../repositories/conversation.repository';
export declare class ConversationService {
    private readonly conversationRepository;
    private readonly messagePolicyService;
    constructor(conversationRepository: ConversationRepository, messagePolicyService: MessagePolicyService);
    resolve(currentUser: AuthenticatedUserEntity, dto: CreateConversationDto): Promise<ResolvedConversationEntity>;
}
