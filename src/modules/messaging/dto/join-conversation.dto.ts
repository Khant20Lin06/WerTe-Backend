import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinConversationDto {
  @ApiProperty({
    description: 'Conversation identifier for the socket room subscription.',
    example: 'con_123',
  })
  @IsString()
  conversationId!: string;
}
