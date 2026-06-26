import { ConversationType, OrderStatus, Prisma } from '@prisma/client';
export declare const conversationOrderContextSelect: {
    id: true;
    orderCode: true;
    status: true;
    customerProfile: {
        select: {
            id: true;
            userId: true;
        };
    };
    branch: {
        select: {
            name: true;
            merchant: {
                select: {
                    id: true;
                    userId: true;
                    name: true;
                };
            };
        };
    };
    delivery: {
        select: {
            id: true;
            rider: {
                select: {
                    id: true;
                    userId: true;
                    displayName: true;
                };
            };
        };
    };
};
export type ConversationOrderContextRecord = Prisma.OrderGetPayload<{
    select: typeof conversationOrderContextSelect;
}>;
export declare class ConversationOrderContextEntity {
    orderId: string;
    orderCode: string;
    status: OrderStatus;
    customer: {
        customerProfileId: string;
        userId: string;
    };
    merchant: {
        merchantId: string;
        userId: string;
        merchantName: string;
    };
    branch: {
        branchName: string;
    };
    deliveryId?: string | null;
    rider: {
        riderId: string;
        userId: string;
        displayName: string;
    } | null;
}
export declare function buildConversationOrderContext(record: ConversationOrderContextRecord): ConversationOrderContextEntity;
export declare function supportsAssignedRiderConversation(type: ConversationType): boolean;
