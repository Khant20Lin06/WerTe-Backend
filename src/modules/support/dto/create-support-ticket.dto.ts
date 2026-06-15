import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportTicketCategory, SupportTicketPriority } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ enum: SupportTicketCategory, example: SupportTicketCategory.ORDER_ISSUE })
  @IsEnum(SupportTicketCategory)
  category!: SupportTicketCategory;

  @ApiProperty({ example: 'Order #ORD-20260601-001 not delivered' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ example: 'I placed an order 2 hours ago but it has not arrived yet.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({ example: 'order_abc123' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ enum: SupportTicketPriority, example: SupportTicketPriority.NORMAL })
  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;
}
