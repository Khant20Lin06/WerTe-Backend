import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressesService } from '../../addresses/services/addresses.service';
import { BranchesService } from '../../branches/services/branches.service';
import { CartQueryService } from '../../carts/services/cart-query.service';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { CheckoutContextEntity } from '../entities/checkout-context.entity';
import { CheckoutValidationService } from './checkout-validation.service';
export type ResolveCheckoutContextInput = {
    branchId: string;
    addressId?: string;
};
export declare class CheckoutContextService {
    private readonly customerProfilesService;
    private readonly addressesService;
    private readonly branchesService;
    private readonly cartQueryService;
    private readonly checkoutValidationService;
    constructor(customerProfilesService: CustomerProfilesService, addressesService: AddressesService, branchesService: BranchesService, cartQueryService: CartQueryService, checkoutValidationService: CheckoutValidationService);
    getValidatedCurrentCustomerCheckoutContext(currentUser: AuthenticatedUserEntity, input: ResolveCheckoutContextInput): Promise<CheckoutContextEntity>;
    private resolveCurrentCustomerProfile;
    private resolveCheckoutAddress;
    private resolveBranch;
}
