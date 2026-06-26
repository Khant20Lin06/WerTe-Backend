import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinConversationDto } from '../dto/join-conversation.dto';
import { MarkMessageReadRequestDto } from '../dto/mark-message-read-request.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationReadService } from '../services/conversation-read.service';
import { MessageDeliveryService } from '../services/message-delivery.service';
import { MessageReceiptService } from '../services/message-receipt.service';
import { MessageService } from '../services/message.service';
import { MessagingSocketAuthService } from '../services/messaging-socket-auth.service';
export declare class MessagingGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly messagingSocketAuthService;
    private readonly conversationReadService;
    private readonly messageService;
    private readonly messageReceiptService;
    private readonly messageDeliveryService;
    server: Server;
    constructor(messagingSocketAuthService: MessagingSocketAuthService, conversationReadService: ConversationReadService, messageService: MessageService, messageReceiptService: MessageReceiptService, messageDeliveryService: MessageDeliveryService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleJoin(client: Socket, payload: JoinConversationDto): Promise<{
        conversationId: string;
        joined: boolean;
        conversation: import("../entities/conversation-summary.entity").ConversationSummaryEntity;
    }>;
    handleLeave(client: Socket, payload: JoinConversationDto): Promise<{
        conversationId: string;
        left: boolean;
    }>;
    handleSend(client: Socket, payload: SendMessageDto): Promise<import("../entities/sent-message.entity").SentMessageEntity>;
    handleMarkRead(client: Socket, payload: MarkMessageReadRequestDto): Promise<import("../entities/marked-message-read.entity").MarkedMessageReadEntity>;
    private getCurrentUserOrThrow;
}
