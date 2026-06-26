import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@prisma/client';
export declare class SupportTicketMessageEntity {
    id: string;
    ticketId: string;
    senderUserId: string;
    body: string;
    isInternal: boolean;
    storageKey?: string | null;
    createdAt: Date;
}
export declare class SupportTicketEntity {
    id: string;
    ticketNumber: string;
    customerId: string;
    assignedAgentId?: string | null;
    orderId?: string | null;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
    status: SupportTicketStatus;
    subject: string;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    messages?: SupportTicketMessageEntity[];
}
