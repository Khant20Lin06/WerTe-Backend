import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  addressOwnershipInclude,
  AddressOwnershipRecord,
} from '../entities/address-ownership.entity';

type AddressDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AddressOwnershipRecord | null> {
    return this.prisma.address.findUnique({
      where: { id },
      include: addressOwnershipInclude,
    });
  }

  listByCustomerProfileId(
    customerProfileId: string,
  ): Promise<AddressOwnershipRecord[]> {
    return this.prisma.address.findMany({
      where: { customerProfileId },
      include: addressOwnershipInclude,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findDefaultByCustomerProfileId(
    customerProfileId: string,
  ): Promise<AddressOwnershipRecord | null> {
    return this.prisma.address.findFirst({
      where: {
        customerProfileId,
        isDefault: true,
      },
      include: addressOwnershipInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  countByCustomerProfileId(
    customerProfileId: string,
    client: AddressDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.address.count({
      where: { customerProfileId },
    });
  }

  clearDefaultByCustomerProfileId(
    customerProfileId: string,
    client: AddressDatabaseClient = this.prisma,
  ) {
    return client.address.updateMany({
      where: {
        customerProfileId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  create(
    data: Prisma.AddressUncheckedCreateInput,
    client: AddressDatabaseClient = this.prisma,
  ): Promise<AddressOwnershipRecord> {
    return client.address.create({
      data,
      include: addressOwnershipInclude,
    });
  }

  update(
    id: string,
    data: Prisma.AddressUpdateInput,
    client: AddressDatabaseClient = this.prisma,
  ): Promise<AddressOwnershipRecord> {
    return client.address.update({
      where: { id },
      data,
      include: addressOwnershipInclude,
    });
  }

  delete(
    id: string,
    client: AddressDatabaseClient = this.prisma,
  ): Promise<AddressOwnershipRecord> {
    return client.address.delete({
      where: { id },
      include: addressOwnershipInclude,
    });
  }

  findLatestByCustomerProfileId(
    customerProfileId: string,
    client: AddressDatabaseClient = this.prisma,
  ): Promise<AddressOwnershipRecord | null> {
    return client.address.findFirst({
      where: { customerProfileId },
      include: addressOwnershipInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}
