import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';
type OrderAccessInput = {
    currentUser: AuthenticatedUserEntity;
    order: OrderSummaryEntity;
};
export declare function hasCustomerOrderAccess({ currentUser, order, }: OrderAccessInput): boolean;
export declare function hasMerchantOrderAccess({ currentUser, order, }: OrderAccessInput): boolean;
export declare function hasRiderOrderAccess({ currentUser, order, }: OrderAccessInput): boolean;
export {};
