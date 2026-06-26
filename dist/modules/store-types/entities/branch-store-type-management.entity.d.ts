import { Prisma } from '@prisma/client';
export declare const branchStoreTypeManagementInclude: {
    branch: {
        select: {
            id: true;
            name: true;
            status: true;
            storeType: true;
            primaryStoreTypeId: true;
            merchant: {
                select: {
                    id: true;
                    name: true;
                };
            };
        };
    };
    storeType: {
        select: {
            id: true;
            code: true;
            name: true;
            isActive: true;
            isSystem: true;
            deletedAt: true;
        };
    };
    requestedBy: {
        select: {
            id: true;
            role: true;
        };
    };
    approvedBy: {
        select: {
            id: true;
            role: true;
        };
    };
};
export type BranchStoreTypeManagementRecord = Prisma.BranchStoreTypeGetPayload<{
    include: typeof branchStoreTypeManagementInclude;
}>;
