import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListSupportTicketsQueryDto } from '../dto/list-support-tickets-query.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { UpdateSupportTicketDto } from '../dto/update-support-ticket.dto';
import { SupportTicketsService } from '../services/support-tickets.service';
export declare class AgentSupportController {
    private readonly service;
    constructor(service: SupportTicketsService);
    listTickets(currentUser: AuthenticatedUserEntity, query: ListSupportTicketsQueryDto): Promise<{
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
    reply(currentUser: AuthenticatedUserEntity, ticketId: string, dto: ReplySupportTicketDto): Promise<{
        id: string;
        body: string;
        createdAt: Date;
        storageKey: string | null;
        ticketId: string;
        senderUserId: string;
        isInternal: boolean;
    }>;
}
