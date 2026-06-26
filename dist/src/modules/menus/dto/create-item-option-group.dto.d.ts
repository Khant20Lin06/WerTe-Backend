import { ItemOptionGroupKind } from '@prisma/client';
export declare class CreateItemOptionGroupDto {
    name: string;
    description?: string;
    kind?: ItemOptionGroupKind;
    minSelect: number;
    maxSelect: number;
    sortOrder?: number;
    isActive?: boolean;
}
