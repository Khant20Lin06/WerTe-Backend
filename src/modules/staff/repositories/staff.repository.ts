import { Injectable } from '@nestjs/common';
import { MerchantStaffRole, StaffStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { staffMemberInclude, StaffMemberRecord } from '../dto/staff-member.dto';

type CreateStaffParams = {
  phone: string;
  passwordHash: string;
  displayName: string;
  merchantId: string;
  role: MerchantStaffRole;
  branchIds: string[];
};

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByMerchantId(merchantId: string): Promise<StaffMemberRecord[]> {
    return this.prisma.merchantStaff.findMany({
      where: { merchantId },
      include: staffMemberInclude,
      orderBy: [{ role: 'asc' }, { displayName: 'asc' }],
    });
  }

  findById(staffId: string): Promise<StaffMemberRecord | null> {
    return this.prisma.merchantStaff.findUnique({
      where: { id: staffId },
      include: staffMemberInclude,
    });
  }

  findByIdAndMerchant(
    staffId: string,
    merchantId: string,
  ): Promise<StaffMemberRecord | null> {
    return this.prisma.merchantStaff.findFirst({
      where: { id: staffId, merchantId },
      include: staffMemberInclude,
    });
  }

  async createStaff(params: CreateStaffParams): Promise<StaffMemberRecord> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: params.phone,
          passwordHash: params.passwordHash,
          role: UserRole.MERCHANT_STAFF,
        },
      });

      const staff = await tx.merchantStaff.create({
        data: {
          userId: user.id,
          merchantId: params.merchantId,
          role: params.role,
          displayName: params.displayName,
          branchAssignments: {
            create: params.branchIds.map((branchId) => ({ branchId })),
          },
        },
        include: staffMemberInclude,
      });

      return staff;
    });
  }

  async updateStaff(
    staffId: string,
    params: {
      role?: MerchantStaffRole;
      status?: StaffStatus;
      branchIds?: string[];
    },
  ): Promise<StaffMemberRecord> {
    return this.prisma.$transaction(async (tx) => {
      if (params.branchIds !== undefined) {
        await tx.branchStaffAssignment.deleteMany({ where: { staffId } });
      }

      return tx.merchantStaff.update({
        where: { id: staffId },
        data: {
          ...(params.role !== undefined && { role: params.role }),
          ...(params.status !== undefined && { status: params.status }),
          ...(params.branchIds !== undefined && {
            branchAssignments: {
              create: params.branchIds.map((branchId) => ({ branchId })),
            },
          }),
        },
        include: staffMemberInclude,
      });
    });
  }

  deleteStaff(staffId: string): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const staff = await tx.merchantStaff.findUnique({
        where: { id: staffId },
        select: { userId: true },
      });
      if (!staff) return;

      await tx.merchantStaff.delete({ where: { id: staffId } });
      await tx.user.delete({ where: { id: staff.userId } });
    });
  }
}
