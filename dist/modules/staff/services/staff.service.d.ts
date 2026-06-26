import { PasswordService } from '../../auth/services/password.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffMemberRecord } from '../dto/staff-member.dto';
import { StaffRepository } from '../repositories/staff.repository';
export declare class StaffService {
    private readonly staffRepository;
    private readonly passwordService;
    constructor(staffRepository: StaffRepository, passwordService: PasswordService);
    listStaff(currentUser: AuthenticatedUserEntity): Promise<StaffMemberRecord[]>;
    inviteStaff(currentUser: AuthenticatedUserEntity, dto: InviteStaffDto): Promise<StaffMemberRecord>;
    updateStaff(currentUser: AuthenticatedUserEntity, staffId: string, dto: UpdateStaffDto): Promise<StaffMemberRecord>;
    removeStaff(currentUser: AuthenticatedUserEntity, staffId: string): Promise<void>;
    private resolveOwnedStaff;
    private requireMerchantId;
}
