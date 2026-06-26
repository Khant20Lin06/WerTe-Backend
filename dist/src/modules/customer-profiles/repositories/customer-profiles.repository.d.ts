import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';
export declare class CustomerProfilesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<CustomerProfileOwnershipRecord | null>;
    findByUserId(userId: string): Promise<CustomerProfileOwnershipRecord | null>;
    findAll(opts: {
        status?: UserStatus;
        search?: string;
    }): Promise<CustomerProfileOwnershipRecord[]>;
    update(id: string, data: Prisma.CustomerProfileUpdateInput): Promise<CustomerProfileOwnershipRecord>;
}
