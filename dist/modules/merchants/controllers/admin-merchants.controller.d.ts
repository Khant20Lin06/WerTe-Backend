import { AdminMerchantListQueryDto } from '../dto/admin-merchant-list.dto';
import { AdminUpdateMerchantStatusDto } from '../dto/admin-update-merchant-status.dto';
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { AdminMerchantManagementService } from '../services/admin-merchant-management.service';
export declare class AdminMerchantsController {
    private readonly adminMerchantManagementService;
    constructor(adminMerchantManagementService: AdminMerchantManagementService);
    listMerchants(query: AdminMerchantListQueryDto): Promise<MerchantProfileDto[]>;
    updateMerchantStatus(merchantId: string, body: AdminUpdateMerchantStatusDto): Promise<MerchantProfileDto>;
}
