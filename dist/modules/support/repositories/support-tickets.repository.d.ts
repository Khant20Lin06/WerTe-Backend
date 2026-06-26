import { SupportTicket, SupportTicketCategory, SupportTicketMessage, SupportTicketPriority, SupportTicketStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
type TicketWithMessages = SupportTicket & {
    messages?: SupportTicketMessage[];
};
export declare class SupportTicketsRepository {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    create(data: {
        ticketNumber: string;
        customerId: string;
        orderId?: string;
        category: SupportTicketCategory;
        priority: SupportTicketPriority;
        subject: string;
        firstMessageBody: string;
    }): Promise<SupportTicket>;
    findById(id: string, includeMessages?: boolean): Promise<TicketWithMessages | null>;
    findByTicketNumber(ticketNumber: string): Promise<SupportTicket | null>;
    listByCustomer(customerId: string, filters: {
        status?: SupportTicketStatus;
        category?: SupportTicketCategory;
        page: number;
        limit: number;
    }): Promise<{
        tickets: SupportTicket[];
        total: number;
    }>;
    listForAgent(filters: {
        status?: SupportTicketStatus;
        category?: SupportTicketCategory;
        priority?: SupportTicketPriority;
        assignedAgentId?: string;
        page: number;
        limit: number;
    }): Promise<{
        tickets: SupportTicket[];
        total: number;
    }>;
    update(id: string, data: {
        status?: SupportTicketStatus;
        priority?: SupportTicketPriority;
        assignedAgentId?: string;
        resolvedAt?: Date | null;
        closedAt?: Date | null;
    }, statusHistoryEntry?: {
        fromStatus: SupportTicketStatus;
        toStatus: SupportTicketStatus;
        changedByUserId: string;
        note?: string;
    }): Promise<SupportTicket>;
    addMessage(data: {
        ticketId: string;
        senderUserId: string;
        body: string;
        isInternal: boolean;
        storageKey?: string;
    }): Promise<SupportTicketMessage>;
    listMessages(ticketId: string): Promise<SupportTicketMessage[]>;
    generateTicketNumber(): Promise<string>;
}
export {};
