import { HttpStatus, Injectable } from '@nestjs/common';
import { SupportTicketPriority, SupportTicketStatus, UserRole } from '@prisma/client';

import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { UpdateSupportTicketDto } from '../dto/update-support-ticket.dto';
import { SupportTicketsRepository } from '../repositories/support-tickets.repository';

const TERMINAL_STATUSES: SupportTicketStatus[] = [
  SupportTicketStatus.RESOLVED,
  SupportTicketStatus.CLOSED,
];

@Injectable()
export class SupportTicketsService {
  constructor(private readonly repo: SupportTicketsRepository) {}

  async createTicket(currentUser: AuthenticatedUserEntity, dto: CreateSupportTicketDto) {
    const ticketNumber = await this.repo.generateTicketNumber();
    return this.repo.create({
      ticketNumber,
      customerId: currentUser.userId,
      orderId: dto.orderId,
      category: dto.category,
      priority: dto.priority ?? SupportTicketPriority.NORMAL,
      subject: dto.subject,
      firstMessageBody: dto.body,
    });
  }

  async listCustomerTickets(
    currentUser: AuthenticatedUserEntity,
    query: ListSupportTicketsQueryDto,
  ) {
    return this.repo.listByCustomer(currentUser.userId, {
      status: query.status,
      category: query.category,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  async getTicket(currentUser: AuthenticatedUserEntity, ticketId: string) {
    const ticket = await this.repo.findById(ticketId, true);
    this.assertTicketAccess(currentUser, ticket, ticketId);
    return ticket;
  }

  async replyToTicket(
    currentUser: AuthenticatedUserEntity,
    ticketId: string,
    dto: ReplySupportTicketDto,
  ) {
    const ticket = await this.repo.findById(ticketId);
    this.assertTicketAccess(currentUser, ticket, ticketId);

    if (TERMINAL_STATUSES.includes(ticket!.status)) {
      throw new AppException(
        'Cannot reply to a resolved or closed ticket.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isAgent = currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.ADMIN;
    const isInternal = isAgent && (dto.isInternal ?? false);

    // If customer replies to PENDING_CUSTOMER ticket, move back to IN_PROGRESS
    const shouldReopen =
      !isAgent && ticket!.status === SupportTicketStatus.PENDING_CUSTOMER;

    const message = await this.repo.addMessage({
      ticketId,
      senderUserId: currentUser.userId,
      body: dto.body,
      isInternal,
      storageKey: dto.storageKey,
    });

    if (shouldReopen) {
      await this.repo.update(
        ticketId,
        { status: SupportTicketStatus.IN_PROGRESS },
        {
          fromStatus: SupportTicketStatus.PENDING_CUSTOMER,
          toStatus: SupportTicketStatus.IN_PROGRESS,
          changedByUserId: currentUser.userId,
          note: 'Customer replied.',
        },
      );
    }

    return message;
  }

  async updateTicket(
    currentUser: AuthenticatedUserEntity,
    ticketId: string,
    dto: UpdateSupportTicketDto,
  ) {
    const ticket = await this.repo.findById(ticketId);
    if (!ticket) {
      throw new AppException('Support ticket not found.', HttpStatus.NOT_FOUND);
    }

    const updateData: Parameters<SupportTicketsRepository['update']>[1] = {};
    let statusHistoryEntry: Parameters<SupportTicketsRepository['update']>[2] | undefined;

    if (dto.status && dto.status !== ticket.status) {
      updateData.status = dto.status;
      if (dto.status === SupportTicketStatus.RESOLVED) updateData.resolvedAt = new Date();
      if (dto.status === SupportTicketStatus.CLOSED) updateData.closedAt = new Date();
      statusHistoryEntry = {
        fromStatus: ticket.status,
        toStatus: dto.status,
        changedByUserId: currentUser.userId,
        note: dto.note,
      };
    }
    if (dto.priority) updateData.priority = dto.priority;
    if (dto.assignedAgentId !== undefined) updateData.assignedAgentId = dto.assignedAgentId;

    return this.repo.update(ticketId, updateData, statusHistoryEntry);
  }

  async listAgentTickets(
    currentUser: AuthenticatedUserEntity,
    query: ListSupportTicketsQueryDto,
  ) {
    return this.repo.listForAgent({
      status: query.status,
      category: query.category,
      priority: query.priority,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  private assertTicketAccess(
    currentUser: AuthenticatedUserEntity,
    ticket: Awaited<ReturnType<SupportTicketsRepository['findById']>>,
    ticketId: string,
  ) {
    if (!ticket) {
      throw new AppException('Support ticket not found.', HttpStatus.NOT_FOUND);
    }
    const isAgent = currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.ADMIN;
    if (!isAgent && ticket.customerId !== currentUser.userId) {
      throw new AppException('Access denied.', HttpStatus.FORBIDDEN);
    }
  }
}
