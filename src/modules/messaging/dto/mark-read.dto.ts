import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({
    description: 'Conversation containing the message that was marked as read.',
    example: 'con_123',
  })
  conversationId!: string;

  @ApiProperty({
    description: 'Message identifier that advanced the participant read position.',
    example: 'msg_123',
  })
  messageId!: string;

  @ApiProperty({
    description: 'ISO timestamp when the read position was recorded.',
    example: '2026-04-20T10:30:00.000Z',
  })
  readAt!: string;
}
