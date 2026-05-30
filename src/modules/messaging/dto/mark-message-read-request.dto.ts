import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MarkMessageReadRequestDto {
  @ApiProperty({
    description: 'Message identifier to mark as read in the realtime channel.',
    example: 'msg_123',
  })
  @IsString()
  messageId!: string;
}
