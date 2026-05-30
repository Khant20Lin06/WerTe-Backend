import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
type MerchantCatalogAccessInput = {
    currentUser: AuthenticatedUserEntity;
    ownerUserId: string;
    merchantId: string;
};
export declare function hasMerchantCatalogAccess({ currentUser, ownerUserId, merchantId, }: MerchantCatalogAccessInput): boolean;
export {};
