import { Injectable } from '@nestjs/common';
import {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

type TicketWithMessages = SupportTicket & { messages?: SupportTicketMessage[] };

const TICKET_SEQ_KEY = 'support:ticket:seq';

@Injectable()
export class SupportTicketsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(data: {
    ticketNumber: string;
    customerId: string;
    orderId?: string;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    subject: string;
    firstMessageBody: string;
  }): Promise<SupportTicket> {
    return this.prisma.supportTicket.create({
      data: {
        ticketNumber: data.ticketNumber,
        customerId: data.customerId,
        orderId: data.orderId ?? null,
        category: data.category,
        priority: data.priority,
        status: SupportTicketStatus.OPEN,
        subject: data.subject,
        messages: {
          create: {
            senderUserId: data.customerId,
            body: data.firstMessageBody,
            isInternal: false,
          },
        },
        statusHistory: {
          create: {
            toStatus: SupportTicketStatus.OPEN,
          },
        },
      },
    });
  }

  async findById(id: string, includeMessages = false): Promise<TicketWithMessages | null> {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: includeMessages ? { messages: { orderBy: { createdAt: 'asc' } } } : undefined,
    });
  }

  async findByTicketNumber(ticketNumber: string): Promise<SupportTicket | null> {
    return this.prisma.supportTicket.findUnique({ where: { ticketNumber } });
  }

  async listByCustomer(
    customerId: string,
    filters: {
      status?: SupportTicketStatus;
      category?: SupportTicketCategory;
      page: number;
      limit: number;
    },
  ): Promise<{ tickets: SupportTicket[]; total: number }> {
    const where = {
      customerId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    };
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { tickets, total };
  }

  async listForAgent(filters: {
    status?: SupportTicketStatus;
    category?: SupportTicketCategory;
    priority?: SupportTicketPriority;
    assignedAgentId?: string;
    page: number;
    limit: number;
  }): Promise<{ tickets: SupportTicket[]; total: number }> {
    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.assignedAgentId !== undefined
        ? { assignedAgentId: filters.assignedAgentId }
        : {}),
    };
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { tickets, total };
  }

  async update(
    id: string,
    data: {
      status?: SupportTicketStatus;
      priority?: SupportTicketPriority;
      assignedAgentId?: string;
      resolvedAt?: Date | null;
      closedAt?: Date | null;
    },
    statusHistoryEntry?: {
      fromStatus: SupportTicketStatus;
      toStatus: SupportTicketStatus;
      changedByUserId: string;
      note?: string;
    },
  ): Promise<SupportTicket> {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.update({ where: { id }, data });
      if (statusHistoryEntry) {
        await tx.supportTicketStatusHistory.create({ data: { ticketId: id, ...statusHistoryEntry } });
      }
      return ticket;
    });
  }

  async addMessage(data: {
    ticketId: string;
    senderUserId: string;
    body: string;
    isInternal: boolean;
    storageKey?: string;
  }): Promise<SupportTicketMessage> {
    return this.prisma.supportTicketMessage.create({ data });
  }

  async listMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    return this.prisma.supportTicketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    // Atomic increment prevents duplicate ticket numbers under concurrent writes.
    const seq = await this.redis.incr(`${TICKET_SEQ_KEY}:${ymd}`);
    return `TKT-${ymd}-${String(seq).padStart(4, '0')}`;
  }
}
