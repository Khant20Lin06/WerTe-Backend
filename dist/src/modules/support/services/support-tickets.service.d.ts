import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { UpdateSupportTicketDto } from '../dto/update-support-ticket.dto';
import { SupportTicketsRepository } from '../repositories/support-tickets.repository';
export declare class SupportTicketsService {
    private readonly repo;
    constructor(repo: SupportTicketsRepository);
    createTicket(currentUser: AuthenticatedUserEntity, dto: CreateSupportTicketDto): Promise<{
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        id: string;
        priority: import(".prisma/client").$Enums.SupportTicketPriority;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        category: import(".prisma/client").$Enums.SupportTicketCategory;
        customerId: string;
        ticketNumber: string;
        assignedAgentId: string | null;
        subject: string;
        resolvedAt: Date | null;
        closedAt: Date | null;
    }>;
    listCustomerTickets(currentUser: AuthenticatedUserEntity, query: ListSupportTicketsQueryDto): Promise<{
        tickets: import(".prisma/client").SupportTicket[];
        total: number;
    }>;
    getTicket(currentUser: AuthenticatedUserEntity, ticketId: string): Promise<({
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        id: string;
        priority: import(".prisma/client").$Enums.SupportTicketPriority;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        category: import(".prisma/client").$Enums.SupportTicketCategory;
        customerId: string;
        ticketNumber: string;
        assignedAgentId: string | null;
        subject: string;
        resolvedAt: Date | null;
        closedAt: Date | null;
    } & {
        messages?: import(".prisma/client").SupportTicketMessage[];
    }) | null>;
    replyToTicket(currentUser: AuthenticatedUserEntity, ticketId: string, dto: ReplySupportTicketDto): Promise<{
        id: string;
        body: string;
        createdAt: Date;
        storageKey: string | null;
        ticketId: string;
        senderUserId: string;
        isInternal: boolean;
    }>;
    updateTicket(currentUser: AuthenticatedUserEntity, ticketId: string, dto: UpdateSupportTicketDto): Promise<{
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        id: string;
        priority: import(".prisma/client").$Enums.SupportTicketPriority;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        category: import(".prisma/client").$Enums.SupportTicketCategory;
        customerId: string;
        ticketNumber: string;
        assignedAgentId: string | null;
        subject: string;
        resolvedAt: Date | null;
        closedAt: Date | null;
    }>;
    listAgentTickets(currentUser: AuthenticatedUserEntity, query: ListSupportTicketsQueryDto): Promise<{
        tickets: import(".prisma/client").SupportTicket[];
        total: number;
    }>;
    private assertTicketAccess;
}
