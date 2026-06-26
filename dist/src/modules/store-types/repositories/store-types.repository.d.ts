import { BranchStoreTypeStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BranchStoreTypeManagementRecord } from '../entities/branch-store-type-management.entity';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';
type StoreTypesDatabaseClient = PrismaService | Prisma.TransactionClient;
declare const branchSummarySelect: {
    id: true;
    merchantId: true;
    name: true;
    status: true;
    storeType: true;
    primaryStoreTypeId: true;
    merchant: {
        select: {
            id: true;
            userId: true;
            name: true;
            storeType: true;
            primaryStoreTypeId: true;
        };
    };
};
export type BranchSummaryRecord = Prisma.BranchGetPayload<{
    select: typeof branchSummarySelect;
}>;
export declare class StoreTypesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listStoreTypes(client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord[]>;
    listActiveStoreTypes(client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord[]>;
    findStoreTypeById(id: string, client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord | null>;
    findStoreTypeByCode(code: string, client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord | null>;
    createStoreType(data: Prisma.StoreTypeCreateInput, client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord>;
    updateStoreType(id: string, data: Prisma.StoreTypeUpdateInput, client?: StoreTypesDatabaseClient): Promise<StoreTypeManagementRecord>;
    findBranchSummaryById(branchId: string, client?: StoreTypesDatabaseClient): Promise<BranchSummaryRecord | null>;
    listBranchStoreTypes(filter: {
        branchId?: string;
        storeTypeId?: string;
        status?: BranchStoreTypeStatus;
    }, client?: StoreTypesDatabaseClient): Promise<BranchStoreTypeManagementRecord[]>;
    findBranchStoreType(branchId: string, storeTypeId: string, client?: StoreTypesDatabaseClient): Promise<BranchStoreTypeManagementRecord | null>;
    createBranchStoreType(data: Prisma.BranchStoreTypeUncheckedCreateInput, client?: StoreTypesDatabaseClient): Promise<BranchStoreTypeManagementRecord>;
    updateBranchStoreType(branchId: string, storeTypeId: string, data: Prisma.BranchStoreTypeUncheckedUpdateInput, client?: StoreTypesDatabaseClient): Promise<BranchStoreTypeManagementRecord>;
    clearBranchPrimaryAssignments(branchId: string, client?: StoreTypesDatabaseClient): Prisma.PrismaPromise<Prisma.BatchPayload>;
    listApprovedBranchStoreTypes(branchId: string, client?: StoreTypesDatabaseClient): Promise<BranchStoreTypeManagementRecord[]>;
    listCustomerDiscoverableBranches(filter: {
        branchId?: string;
        merchantId?: string;
        storeTypeCodes?: string[];
        township?: string;
        keyword?: string;
    }, client?: StoreTypesDatabaseClient): Promise<CustomerStoreDiscoveryRecord[]>;
    updateBranchPrimaryStoreType(branchId: string, data: Prisma.BranchUncheckedUpdateInput, client?: StoreTypesDatabaseClient): Prisma.Prisma__BranchClient<{
        status: import(".prisma/client").$Enums.BranchStatus;
        name: string;
        id: string;
        storeType: string;
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
}
export {};
