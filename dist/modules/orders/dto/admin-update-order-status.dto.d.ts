import { OrderStatus } from '@prisma/client';
export declare class AdminUpdateOrderStatusDto {
    status: OrderStatus;
    reasonCode: string;
    note?: string;
}
