import { MerchantStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { MerchantsService } from './merchants.service';
export declare class AdminMerchantManagementService {
    private readonly prisma;
    private readonly merchantsService;
    constructor(prisma: PrismaService, merchantsService: MerchantsService);
    listMerchants(status?: MerchantStatus): Promise<MerchantProfileDto[]>;
    updateMerchantStatus(merchantId: string, status: Exclude<MerchantStatus, 'PENDING'>): Promise<MerchantProfileDto>;
}
