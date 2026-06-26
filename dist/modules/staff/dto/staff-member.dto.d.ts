import { MerchantStaffRole, StaffStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
export declare const staffMemberInclude: {
    user: {
        select: {
            phone: true;
        };
    };
    branchAssignments: {
        select: {
            branchId: true;
        };
    };
};
export type StaffMemberRecord = Prisma.MerchantStaffGetPayload<{
    include: typeof staffMemberInclude;
}>;
export declare class StaffMemberDto {
    staffId: string;
    userId: string;
    phone: string;
    displayName: string;
    role: MerchantStaffRole;
    status: StaffStatus;
    branchIds: string[];
    createdAt: string;
}
export declare function toStaffMemberDto(record: StaffMemberRecord): StaffMemberDto;
export declare class StaffMemberListDto {
    staff: StaffMemberDto[];
}
export declare class ApiPropertyOptionalString {
}
