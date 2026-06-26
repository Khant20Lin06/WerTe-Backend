import { Prisma } from '@prisma/client';
export declare const customerStoreDiscoveryInclude: {
    merchant: {
        select: {
            id: true;
            name: true;
            status: true;
        };
    };
    storeTypes: {
        where: {
            status: "APPROVED";
            storeType: {
                isActive: true;
                deletedAt: null;
            };
        };
        orderBy: [{
            isPrimary: "desc";
        }, {
            sortOrder: "asc";
        }, {
            createdAt: "asc";
        }];
        include: {
            storeType: {
                select: {
                    id: true;
                    code: true;
                    name: true;
                    sortOrder: true;
                };
            };
        };
    };
};
export type CustomerStoreDiscoveryRecord = Prisma.BranchGetPayload<{
    include: typeof customerStoreDiscoveryInclude;
}>;
