import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStaffRole, StaffStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const staffMemberInclude = Prisma.validator<Prisma.MerchantStaffInclude>()({
  user: { select: { phone: true } },
  branchAssignments: { select: { branchId: true } },
});

export type StaffMemberRecord = Prisma.MerchantStaffGetPayload<{
  include: typeof staffMemberInclude;
}>;

export class StaffMemberDto {
  @ApiProperty({ example: 'staff_1' })
  staffId!: string;

  @ApiProperty({ example: 'usr_2' })
  userId!: string;

  @ApiProperty({ example: '09420000001' })
  phone!: string;

  @ApiProperty({ example: 'Ko Aung' })
  displayName!: string;

  @ApiProperty({ enum: MerchantStaffRole })
  role!: MerchantStaffRole;

  @ApiProperty({ enum: StaffStatus })
  status!: StaffStatus;

  @ApiProperty({ type: [String] })
  branchIds!: string[];

  @ApiProperty()
  createdAt!: string;
}

export function toStaffMemberDto(record: StaffMemberRecord): StaffMemberDto {
  return {
    staffId: record.id,
    userId: record.userId,
    phone: record.user.phone,
    displayName: record.displayName,
    role: record.role,
    status: record.status,
    branchIds: record.branchAssignments.map((a) => a.branchId),
    createdAt: record.createdAt.toISOString(),
  };
}

export class StaffMemberListDto {
  @ApiProperty({ type: [StaffMemberDto] })
  staff!: StaffMemberDto[];
}

export class ApiPropertyOptionalString {}
