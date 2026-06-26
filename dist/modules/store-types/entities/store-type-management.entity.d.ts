import { Prisma } from '@prisma/client';
export declare const storeTypeManagementInclude: {
    _count: {
        select: {
            branchAssignments: true;
            branchPrimaries: true;
            merchantPrimaries: true;
        };
    };
};
export type StoreTypeManagementRecord = Prisma.StoreTypeGetPayload<{
    include: typeof storeTypeManagementInclude;
}>;
