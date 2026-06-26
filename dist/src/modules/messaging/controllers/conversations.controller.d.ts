import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { ConversationService } from '../services/conversation.service';
export declare class ConversationsController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    create(currentUser: AuthenticatedUserEntity, body: CreateConversationDto): Promise<import("../entities/resolved-conversation.entity").ResolvedConversationEntity>;
}
