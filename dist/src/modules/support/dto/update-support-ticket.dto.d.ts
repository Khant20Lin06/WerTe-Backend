import { SupportTicketPriority, SupportTicketStatus } from '@prisma/client';
export declare class UpdateSupportTicketDto {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    assignedAgentId?: string;
    note?: string;
}
