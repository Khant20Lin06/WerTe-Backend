import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
type CustomerCartAccessInput = {
    currentUser: AuthenticatedUserEntity;
    ownerUserId: string;
    customerProfileId: string;
};
export declare function hasCustomerCartAccess({ currentUser, ownerUserId, customerProfileId, }: CustomerCartAccessInput): boolean;
export {};
