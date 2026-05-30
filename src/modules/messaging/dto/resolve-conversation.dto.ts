import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ConversationTypeValue } from './create-conversation.dto';

export class ResolveConversationDto {
  @ApiProperty({
    description: 'Allowed conversation type for the order-scoped chat flow.',
    enum: ConversationTypeValue,
    enumName: 'ConversationTypeValue',
    example: ConversationTypeValue.orderChat,
  })
  @IsEnum(ConversationTypeValue)
  type!: ConversationTypeValue;
}
