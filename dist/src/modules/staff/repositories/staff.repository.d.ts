import { MerchantStaffRole, StaffStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { StaffMemberRecord } from '../dto/staff-member.dto';
type CreateStaffParams = {
    phone: string;
    passwordHash: string;
    displayName: string;
    merchantId: string;
    role: MerchantStaffRole;
    branchIds: string[];
};
export declare class StaffRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByMerchantId(merchantId: string): Promise<StaffMemberRecord[]>;
    findById(staffId: string): Promise<StaffMemberRecord | null>;
    findByIdAndMerchant(staffId: string, merchantId: string): Promise<StaffMemberRecord | null>;
    createStaff(params: CreateStaffParams): Promise<StaffMemberRecord>;
    updateStaff(staffId: string, params: {
        role?: MerchantStaffRole;
        status?: StaffStatus;
        branchIds?: string[];
    }): Promise<StaffMemberRecord>;
    deleteStaff(staffId: string): Promise<void>;
}
export {};
