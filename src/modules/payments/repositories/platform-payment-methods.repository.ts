import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type PlatformPaymentMethodRecord = {
  id: string;
  method: PaymentMethod;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  sortOrder: number;
  bankDetails: Prisma.JsonValue | null;
  updatedAt: Date;
  createdAt: Date;
};

@Injectable()
export class PlatformPaymentMethodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PlatformPaymentMethodRecord[]> {
    return (this.prisma as any).platformPaymentMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  findEnabled(): Promise<PlatformPaymentMethodRecord[]> {
    return (this.prisma as any).platformPaymentMethod.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  upsert(
    method: PaymentMethod,
    data: {
      displayName: string;
      description?: string | null;
      isEnabled: boolean;
      sortOrder?: number;
      bankDetails?: Prisma.InputJsonValue | null;
    },
  ): Promise<PlatformPaymentMethodRecord> {
    return (this.prisma as any).platformPaymentMethod.upsert({
      where: { method },
      create: {
        method,
        displayName: data.displayName,
        description: data.description ?? null,
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder ?? 0,
        bankDetails: data.bankDetails ?? null,
      },
      update: {
        displayName: data.displayName,
        description: data.description ?? null,
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder ?? 0,
        bankDetails: data.bankDetails ?? null,
      },
    });
  }
}
