import { Server } from 'socket.io';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
export declare class MessageDeliveryService {
    private readonly queueService;
    private server;
    constructor(queueService: QueueService);
    attachServer(server: Server): void;
    emitMessageCreated(message: SentMessageEntity): void;
    emitMessageRead(payload: MarkedMessageReadEntity): void;
    emitConversationUpdated(conversationId: string): void;
    queuePushFallback(conversationId: string): Promise<void>;
}
