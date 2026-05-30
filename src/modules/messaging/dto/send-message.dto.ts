import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  SendMessageAttachmentDto,
  SendMessageAttachmentTypeValue,
} from './send-message-attachment.dto';

export enum SendMessageTypeValue {
  text = 'text',
  image = 'image',
  file = 'file',
  proofOfHandoff = 'proof_of_handoff',
  proofOfDelivery = 'proof_of_delivery',
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation receiving the message.',
    example: 'con_123',
  })
  @IsString()
  conversationId!: string;

  @ApiProperty({
    description: 'Message type the authenticated actor is sending.',
    enum: SendMessageTypeValue,
    enumName: 'SendMessageTypeValue',
    example: SendMessageTypeValue.text,
    required: false,
  })
  @IsOptional()
  @IsEnum(SendMessageTypeValue)
  type?: SendMessageTypeValue;

  @ApiProperty({
    description: 'Message body for text or caption-style payloads.',
    example: 'I am on the way.',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  body?: string;

  @ApiProperty({
    description: 'Attachment references associated with the message payload.',
    type: [SendMessageAttachmentDto],
    required: false,
    example: [
      {
        type: SendMessageAttachmentTypeValue.image,
        storageKey: 'messages/order_1/image_1.jpg',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SendMessageAttachmentDto)
  attachments?: SendMessageAttachmentDto[];
}
