import { Prisma } from '@prisma/client';
export declare const zoneManagementSelect: {
    id: true;
    code: true;
    name: true;
    description: true;
    status: true;
    createdAt: true;
    updatedAt: true;
    _count: {
        select: {
            branchZones: true;
        };
    };
};
export type ZoneManagementRecord = Prisma.ZoneGetPayload<{
    select: typeof zoneManagementSelect;
}>;
