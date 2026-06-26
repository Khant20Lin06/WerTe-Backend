import { SupportTicketCategory, SupportTicketPriority } from '@prisma/client';
export declare class CreateSupportTicketDto {
    category: SupportTicketCategory;
    subject: string;
    body: string;
    orderId?: string;
    priority?: SupportTicketPriority;
}
