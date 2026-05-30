import { ZoneStatus } from '@prisma/client';
export declare class CreateZoneDto {
    code: string;
    name: string;
    description?: string;
    status?: ZoneStatus;
}
