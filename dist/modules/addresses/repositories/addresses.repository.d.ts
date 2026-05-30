import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AddressOwnershipRecord } from '../entities/address-ownership.entity';
type AddressDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class AddressesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<AddressOwnershipRecord | null>;
    listByCustomerProfileId(customerProfileId: string): Promise<AddressOwnershipRecord[]>;
    findDefaultByCustomerProfileId(customerProfileId: string): Promise<AddressOwnershipRecord | null>;
    countByCustomerProfileId(customerProfileId: string, client?: AddressDatabaseClient): Promise<number>;
    clearDefaultByCustomerProfileId(customerProfileId: string, client?: AddressDatabaseClient): Prisma.PrismaPromise<Prisma.BatchPayload>;
    create(data: Prisma.AddressUncheckedCreateInput, client?: AddressDatabaseClient): Promise<AddressOwnershipRecord>;
    update(id: string, data: Prisma.AddressUpdateInput, client?: AddressDatabaseClient): Promise<AddressOwnershipRecord>;
    delete(id: string, client?: AddressDatabaseClient): Promise<AddressOwnershipRecord>;
    findLatestByCustomerProfileId(customerProfileId: string, client?: AddressDatabaseClient): Promise<AddressOwnershipRecord | null>;
}
export {};
