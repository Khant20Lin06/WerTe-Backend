import { Server } from 'socket.io';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
export declare class MessageDeliveryService {
    private server;
    attachServer(server: Server): void;
    emitMessageCreated(message: SentMessageEntity): void;
    emitMessageRead(payload: MarkedMessageReadEntity): void;
    emitConversationUpdated(conversationId: string): void;
    queuePushFallback(_conversationId: string): Promise<void>;
}
