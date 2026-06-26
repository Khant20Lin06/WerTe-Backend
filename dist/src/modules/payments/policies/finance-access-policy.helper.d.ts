import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
export declare function hasCustomerFinanceScope(currentUser: AuthenticatedUserEntity): boolean;
export declare function requireCustomerFinanceScope(currentUser: AuthenticatedUserEntity): string;
export declare function hasAdminFinanceAccess(currentUser: AuthenticatedUserEntity): boolean;
export declare function requireAdminFinanceAccess(currentUser: AuthenticatedUserEntity, resourceLabel: 'payments' | 'refunds'): void;
