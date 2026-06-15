import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ReplySupportTicketDto {
  @ApiProperty({ example: 'Thank you for contacting us. We are looking into your issue.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({ example: false, description: 'Internal note visible to support agents only' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ example: 'attachments/ticket_1/photo.jpg' })
  @IsOptional()
  @IsString()
  storageKey?: string;
}
