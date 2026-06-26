import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
export declare class StoreTypePolicyService {
    canManageStoreTypes(currentUser: AuthenticatedUserEntity): boolean;
    canBrowseStoreTypes(currentUser: AuthenticatedUserEntity): boolean;
    canRequestStoreTypes(currentUser: AuthenticatedUserEntity): boolean;
}
