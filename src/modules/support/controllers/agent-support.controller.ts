import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { UpdateSupportTicketDto } from '../dto/update-support-ticket.dto';
import { SupportTicketEntity, SupportTicketMessageEntity } from '../entities/support-ticket.entity';
import { SupportTicketsService } from '../services/support-tickets.service';

@ApiTags('support-agent')
@ApiBearerAuth('access-token')
@Roles(UserRole.SUPPORT, UserRole.ADMIN)
@Controller('support/tickets')
export class AgentSupportController {
  constructor(private readonly service: SupportTicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all support tickets (agent/admin view)' })
  @ApiOkResponse({ type: [SupportTicketEntity] })
  listTickets(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListSupportTicketsQueryDto,
  ) {
    return this.service.listAgentTickets(currentUser, query);
  }

  @Get(':ticketId')
  @ApiOperation({ summary: 'Get a support ticket with full message history' })
  @ApiOkResponse({ type: SupportTicketEntity })
  getTicket(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('ticketId') ticketId: string,
  ) {
    return this.service.getTicket(currentUser, ticketId);
  }

  @Patch(':ticketId')
  @ApiOperation({ summary: 'Update ticket status, priority, or assignment' })
  @ApiOkResponse({ type: SupportTicketEntity })
  updateTicket(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
  ) {
    return this.service.updateTicket(currentUser, ticketId, dto);
  }

  @Post(':ticketId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a ticket (supports internal notes)' })
  @ApiCreatedResponse({ type: SupportTicketMessageEntity })
  reply(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.service.replyToTicket(currentUser, ticketId, dto);
  }
}
