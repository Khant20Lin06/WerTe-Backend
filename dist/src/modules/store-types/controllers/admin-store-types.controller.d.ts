import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateStoreTypeDto } from '../dto/create-store-type.dto';
import { StoreTypeDto } from '../dto/store-type.dto';
import { UpdateStoreTypeDto } from '../dto/update-store-type.dto';
import { StoreTypeManagementService } from '../services/store-type-management.service';
export declare class AdminStoreTypesController {
    private readonly storeTypeManagementService;
    constructor(storeTypeManagementService: StoreTypeManagementService);
    list(currentUser: AuthenticatedUserEntity): Promise<StoreTypeDto[]>;
    get(currentUser: AuthenticatedUserEntity, storeTypeId: string): Promise<StoreTypeDto>;
    create(currentUser: AuthenticatedUserEntity, body: CreateStoreTypeDto): Promise<StoreTypeDto>;
    update(currentUser: AuthenticatedUserEntity, storeTypeId: string, body: UpdateStoreTypeDto): Promise<StoreTypeDto>;
    archive(currentUser: AuthenticatedUserEntity, storeTypeId: string): Promise<StoreTypeDto>;
    activate(currentUser: AuthenticatedUserEntity, storeTypeId: string): Promise<StoreTypeDto>;
}
