import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessageService } from '../services/message.service';
export declare class MessagesController {
    private readonly messageService;
    constructor(messageService: MessageService);
    send(currentUser: AuthenticatedUserEntity, body: SendMessageDto): Promise<import("../entities/sent-message.entity").SentMessageEntity>;
}
