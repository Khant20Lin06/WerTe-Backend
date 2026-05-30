import { Prisma, ZoneStatus } from '@prisma/client';
export declare const zoneReadSelect: {
    id: true;
    code: true;
    name: true;
    description: true;
    status: true;
    createdAt: true;
    updatedAt: true;
};
export type ZoneReadRecord = Prisma.ZoneGetPayload<{
    select: typeof zoneReadSelect;
}>;
export declare class ZoneReadEntity {
    zoneId: string;
    code: string;
    name: string;
    description?: string | null;
    status: ZoneStatus;
}
export declare function buildZoneRead(zone: ZoneReadRecord): ZoneReadEntity;
