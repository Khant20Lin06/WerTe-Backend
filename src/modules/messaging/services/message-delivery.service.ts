import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

import {
  QueueJobNames,
  QueueNames,
} from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';

@Injectable()
export class MessageDeliveryService {
  private server: Server | null = null;

  constructor(private readonly queueService: QueueService) {}

  attachServer(server: Server) {
    this.server = server;
  }

  emitMessageCreated(message: SentMessageEntity) {
    this.server?.to(message.conversationId).emit('message.created', message);
  }

  emitMessageRead(payload: MarkedMessageReadEntity) {
    this.server?.to(payload.conversationId).emit('message.read', payload);
  }

  emitConversationUpdated(conversationId: string) {
    this.server?.to(conversationId).emit('conversation.updated', {
      conversationId,
    });
  }

  async queuePushFallback(conversationId: string) {
    await this.queueService.add(
      QueueNames.messagingFallback,
      QueueJobNames.messagingFallback.pushFallback,
      {
        conversationId,
      },
    );
  }
}
