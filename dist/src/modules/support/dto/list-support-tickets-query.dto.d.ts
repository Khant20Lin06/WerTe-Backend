import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@prisma/client';
export declare class ListSupportTicketsQueryDto {
    status?: SupportTicketStatus;
    category?: SupportTicketCategory;
    priority?: SupportTicketPriority;
    page?: number;
    limit?: number;
}
