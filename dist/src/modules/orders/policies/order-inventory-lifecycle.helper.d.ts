import { OrderStatus } from '@prisma/client';
export declare function shouldReleaseInventoryForOrderTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean;
