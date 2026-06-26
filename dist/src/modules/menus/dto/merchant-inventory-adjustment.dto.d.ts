import { AuditResourceType, UserRole } from '@prisma/client';
import { AuditLogEntity } from '../../audit/entities/audit-log.entity';
export declare class MerchantInventoryAdjustmentActorDto {
    userId: string;
    role: UserRole;
    phone: string;
}
export declare class MerchantInventoryAdjustmentDto {
    auditLogId: string;
    resourceType: AuditResourceType;
    resourceId: string;
    resourceLabel: string | null;
    delta: number;
    reasonCode: string | null;
    note: string | null;
    beforeStockQuantity: number | null;
    afterStockQuantity: number | null;
    lowStockThreshold: number | null;
    actor: MerchantInventoryAdjustmentActorDto | null;
    createdAt: string;
}
export declare function toMerchantInventoryAdjustmentDto(auditLog: AuditLogEntity): MerchantInventoryAdjustmentDto;
