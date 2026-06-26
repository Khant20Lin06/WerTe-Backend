import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AvailableStoreTypeDto } from '../dto/available-store-type.dto';
import { BranchStoreTypeDto } from '../dto/branch-store-type.dto';
import { RequestBranchStoreTypeDto } from '../dto/request-branch-store-type.dto';
import { StoreTypePolicyService } from '../policies/store-type-policy.service';
import { StoreTypesRepository } from '../repositories/store-types.repository';
import { StoreTypeCacheService } from './store-type-cache.service';
export declare class MerchantStoreTypeRequestService {
    private readonly prisma;
    private readonly storeTypesRepository;
    private readonly storeTypeCache;
    private readonly storeTypePolicyService;
    private readonly auditService;
    constructor(prisma: PrismaService, storeTypesRepository: StoreTypesRepository, storeTypeCache: StoreTypeCacheService, storeTypePolicyService: StoreTypePolicyService, auditService: AuditService);
    listAvailableStoreTypes(currentUser: AuthenticatedUserEntity): Promise<AvailableStoreTypeDto[]>;
    listCurrentMerchantBranchStoreTypes(currentUser: AuthenticatedUserEntity, branchId: string): Promise<BranchStoreTypeDto[]>;
    requestCurrentMerchantBranchStoreType(currentUser: AuthenticatedUserEntity, branchId: string, payload: RequestBranchStoreTypeDto): Promise<BranchStoreTypeDto>;
    private assertCanRequestStoreTypes;
    private requireOwnedBranch;
    private requireRequestableStoreType;
    private requireBranchStoreType;
    private normalizeOptionalString;
}
