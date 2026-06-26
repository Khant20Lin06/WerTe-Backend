import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffMemberDto } from '../dto/staff-member.dto';
import { StaffService } from '../services/staff.service';
export declare class MerchantStaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    list(currentUser: AuthenticatedUserEntity): Promise<StaffMemberDto[]>;
    invite(currentUser: AuthenticatedUserEntity, body: InviteStaffDto): Promise<StaffMemberDto>;
    update(currentUser: AuthenticatedUserEntity, staffId: string, body: UpdateStaffDto): Promise<StaffMemberDto>;
    remove(currentUser: AuthenticatedUserEntity, staffId: string): Promise<void>;
}
