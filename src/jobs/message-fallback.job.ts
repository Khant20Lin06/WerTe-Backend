import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';

type MessageFallbackJobPayload = {
  conversationId: string;
};

@Injectable()
export class MessageFallbackJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.messagingFallback,
      QueueJobNames.messagingFallback.pushFallback,
      (payload) => this.handle(payload as MessageFallbackJobPayload),
    );
  }

  async handle(payload: MessageFallbackJobPayload) {
    this.logger.logEvent(
      'Message fallback baseline job processed.',
      {
        conversationId: payload.conversationId,
      },
      'MessageFallbackJob',
    );
  }
}
