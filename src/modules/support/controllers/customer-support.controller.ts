import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { SupportTicketEntity, SupportTicketMessageEntity } from '../entities/support-ticket.entity';
import { SupportTicketsService } from '../services/support-tickets.service';

@ApiTags('customer-support')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/support/tickets')
export class CustomerSupportController {
  constructor(private readonly service: SupportTicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Open a new support ticket' })
  @ApiCreatedResponse({ type: SupportTicketEntity })
  createTicket(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.service.createTicket(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my support tickets' })
  @ApiOkResponse({ type: [SupportTicketEntity] })
  listTickets(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListSupportTicketsQueryDto,
  ) {
    return this.service.listCustomerTickets(currentUser, query);
  }

  @Get(':ticketId')
  @ApiOperation({ summary: 'Get a support ticket with messages' })
  @ApiOkResponse({ type: SupportTicketEntity })
  getTicket(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('ticketId') ticketId: string,
  ) {
    return this.service.getTicket(currentUser, ticketId);
  }

  @Post(':ticketId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a support ticket' })
  @ApiCreatedResponse({ type: SupportTicketMessageEntity })
  reply(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.service.replyToTicket(currentUser, ticketId, dto);
  }
}
