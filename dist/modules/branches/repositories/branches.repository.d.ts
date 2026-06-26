import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
type BranchDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class BranchesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string, client?: BranchDatabaseClient): Promise<BranchOwnershipRecord | null>;
    listByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[]>;
    create(data: Prisma.BranchUncheckedCreateInput, client?: BranchDatabaseClient): Prisma.Prisma__BranchClient<{
        merchant: {
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
            storeType: string;
            status: import(".prisma/client").$Enums.MerchantStatus;
            name: string;
            id: string;
            userId: string;
        };
        branchZones: {
            zone: {
                status: import(".prisma/client").$Enums.ZoneStatus;
                name: string;
                id: string;
                code: string;
            };
            zoneId: string;
        }[];
        staffAssignments: {
            staffId: string;
        }[];
    } & {
        storeType: string;
        status: import(".prisma/client").$Enums.BranchStatus;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        contactPhone: string | null;
        line1: string | null;
        township: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        primaryStoreTypeId: string | null;
        operatingHours: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: Prisma.BranchUpdateInput, client?: BranchDatabaseClient): Prisma.Prisma__BranchClient<{
        merchant: {
            user: {
                status: import(".prisma/client").$Enums.UserStatus;
                id: string;
                phone: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
            storeType: string;
            status: import(".prisma/client").$Enums.MerchantStatus;
            name: string;
            id: string;
            userId: string;
        };
        branchZones: {
            zone: {
                status: import(".prisma/client").$Enums.ZoneStatus;
                name: string;
                id: string;
                code: string;
            };
            zoneId: string;
        }[];
        staffAssignments: {
            staffId: string;
        }[];
    } & {
        storeType: string;
        status: import(".prisma/client").$Enums.BranchStatus;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        contactPhone: string | null;
        line1: string | null;
        township: string;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        primaryStoreTypeId: string | null;
        operatingHours: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    clearZoneAssignments(branchId: string, client?: BranchDatabaseClient): Prisma.PrismaPromise<Prisma.BatchPayload>;
    assignZones(branchId: string, zoneIds: string[], client?: BranchDatabaseClient): Promise<{
        count: number;
    }>;
}
export {};
