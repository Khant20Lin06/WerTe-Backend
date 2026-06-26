import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
export declare class MerchantsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<MerchantOwnershipRecord | null>;
    findByUserId(userId: string): Promise<MerchantOwnershipRecord | null>;
    update(id: string, data: Prisma.MerchantUpdateInput): Promise<MerchantOwnershipRecord>;
}
