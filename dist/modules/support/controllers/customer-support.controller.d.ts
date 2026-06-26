import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { SupportTicketsService } from '../services/support-tickets.service';
export declare class CustomerSupportController {
    private readonly service;
    constructor(service: SupportTicketsService);
    createTicket(currentUser: AuthenticatedUserEntity, dto: CreateSupportTicketDto): Promise<{
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        category: import(".prisma/client").$Enums.SupportTicketCategory;
        customerId: string;
        ticketNumber: string;
        assignedAgentId: string | null;
        priority: import(".prisma/client").$Enums.SupportTicketPriority;
        subject: string;
        resolvedAt: Date | null;
        closedAt: Date | null;
    }>;
    listTickets(currentUser: AuthenticatedUserEntity, query: ListSupportTicketsQueryDto): Promise<{
        tickets: import(".prisma/client").SupportTicket[];
        total: number;
    }>;
    getTicket(currentUser: AuthenticatedUserEntity, ticketId: string): Promise<({
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        category: import(".prisma/client").$Enums.SupportTicketCategory;
        customerId: string;
        ticketNumber: string;
        assignedAgentId: string | null;
        priority: import(".prisma/client").$Enums.SupportTicketPriority;
        subject: string;
        resolvedAt: Date | null;
        closedAt: Date | null;
    } & {
        messages?: import(".prisma/client").SupportTicketMessage[];
    }) | null>;
    reply(currentUser: AuthenticatedUserEntity, ticketId: string, dto: ReplySupportTicketDto): Promise<{
        id: string;
        createdAt: Date;
        body: string;
        storageKey: string | null;
        ticketId: string;
        senderUserId: string;
        isInternal: boolean;
    }>;
}
