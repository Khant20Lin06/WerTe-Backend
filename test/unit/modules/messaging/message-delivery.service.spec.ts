import { MessageType } from '@prisma/client';
import { Server } from 'socket.io';

import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { MessageDeliveryService } from '../../../../src/modules/messaging/services/message-delivery.service';

describe('MessageDeliveryService', () => {
  it('emits message and conversation events into the conversation room', () => {
    const roomEmitter = {
      emit: jest.fn(),
    };
    const server = {
      to: jest.fn().mockReturnValue(roomEmitter),
    } as unknown as Server;
    const queueService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const service = new MessageDeliveryService(queueService);

    service.attachServer(server);
    service.emitMessageCreated({
      messageId: 'msg_1',
      conversationId: 'con_1',
      senderKind: 'USER',
      senderId: 'usr_1',
      type: MessageType.TEXT,
      systemEventCode: null,
      body: 'Hello',
      metadataJson: null,
      deletedAt: null,
      createdAt: '2026-04-20T10:00:00.000Z',
      attachments: [],
      receipts: [],
    });
    service.emitMessageRead({
      conversationId: 'con_1',
      messageId: 'msg_1',
      readAt: '2026-04-20T10:01:00.000Z',
    });
    service.emitConversationUpdated('con_1');

    expect(server.to).toHaveBeenCalledWith('con_1');
    expect(roomEmitter.emit).toHaveBeenCalledWith(
      'message.created',
      expect.objectContaining({
        messageId: 'msg_1',
      }),
    );
    expect(roomEmitter.emit).toHaveBeenCalledWith('message.read', {
      conversationId: 'con_1',
      messageId: 'msg_1',
      readAt: '2026-04-20T10:01:00.000Z',
    });
    expect(roomEmitter.emit).toHaveBeenCalledWith('conversation.updated', {
      conversationId: 'con_1',
    });
  });

  it('queues message fallback work through the queue service', async () => {
    const queueService = {
      add: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueueService>;
    const service = new MessageDeliveryService(queueService);

    await service.queuePushFallback('con_1');

    expect(queueService.add).toHaveBeenCalledWith(
      'messaging-fallback',
      'message-push-fallback',
      {
        conversationId: 'con_1',
      },
    );
  });
});
