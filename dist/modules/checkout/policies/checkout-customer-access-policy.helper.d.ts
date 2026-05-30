import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
type CheckoutCustomerAccessInput = {
    currentUser: AuthenticatedUserEntity;
    ownerUserId: string;
    customerProfileId: string;
};
export declare function hasCheckoutCustomerAccess({ currentUser, ownerUserId, customerProfileId, }: CheckoutCustomerAccessInput): boolean;
export {};
