import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@prisma/client';

export class SupportTicketMessageEntity {
  @ApiProperty() id!: string;
  @ApiProperty() ticketId!: string;
  @ApiProperty() senderUserId!: string;
  @ApiProperty() body!: string;
  @ApiProperty() isInternal!: boolean;
  @ApiPropertyOptional() storageKey?: string | null;
  @ApiProperty() createdAt!: Date;
}

export class SupportTicketEntity {
  @ApiProperty() id!: string;
  @ApiProperty() ticketNumber!: string;
  @ApiProperty() customerId!: string;
  @ApiPropertyOptional() assignedAgentId?: string | null;
  @ApiPropertyOptional() orderId?: string | null;
  @ApiProperty({ enum: SupportTicketCategory }) category!: SupportTicketCategory;
  @ApiProperty({ enum: SupportTicketPriority }) priority!: SupportTicketPriority;
  @ApiProperty({ enum: SupportTicketStatus }) status!: SupportTicketStatus;
  @ApiProperty() subject!: string;
  @ApiPropertyOptional() resolvedAt?: Date | null;
  @ApiPropertyOptional() closedAt?: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional({ type: () => [SupportTicketMessageEntity] })
  messages?: SupportTicketMessageEntity[];
}
