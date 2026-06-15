import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PasswordService } from '../../auth/services/password.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffMemberRecord } from '../dto/staff-member.dto';
import { StaffRepository } from '../repositories/staff.repository';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly passwordService: PasswordService,
  ) {}

  listStaff(currentUser: AuthenticatedUserEntity): Promise<StaffMemberRecord[]> {
    const merchantId = this.requireMerchantId(currentUser);
    return this.staffRepository.findByMerchantId(merchantId);
  }

  async inviteStaff(
    currentUser: AuthenticatedUserEntity,
    dto: InviteStaffDto,
  ): Promise<StaffMemberRecord> {
    const merchantId = this.requireMerchantId(currentUser);
    const passwordHash = await this.passwordService.hash(dto.password);

    try {
      return await this.staffRepository.createStaff({
        phone: dto.phone.trim(),
        passwordHash,
        displayName: dto.displayName.trim(),
        merchantId,
        role: dto.role,
        branchIds: dto.branchIds ?? [],
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        throw new AppException(
          'A user with this phone number already exists.',
          HttpStatus.CONFLICT,
          { code: ErrorCodes.conflict },
        );
      }
      throw err;
    }
  }

  async updateStaff(
    currentUser: AuthenticatedUserEntity,
    staffId: string,
    dto: UpdateStaffDto,
  ): Promise<StaffMemberRecord> {
    const merchantId = this.requireMerchantId(currentUser);
    await this.resolveOwnedStaff(merchantId, staffId);

    return this.staffRepository.updateStaff(staffId, {
      role: dto.role,
      status: dto.status,
      branchIds: dto.branchIds,
    });
  }

  async removeStaff(
    currentUser: AuthenticatedUserEntity,
    staffId: string,
  ): Promise<void> {
    const merchantId = this.requireMerchantId(currentUser);
    await this.resolveOwnedStaff(merchantId, staffId);
    await this.staffRepository.deleteStaff(staffId);
  }

  private async resolveOwnedStaff(
    merchantId: string,
    staffId: string,
  ): Promise<StaffMemberRecord> {
    const staff = await this.staffRepository.findByIdAndMerchant(staffId, merchantId);
    if (!staff) {
      throw new AppException('Staff member not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }
    return staff;
  }

  private requireMerchantId(currentUser: AuthenticatedUserEntity): string {
    const merchantId = currentUser.actorContext.merchantId;
    if (!merchantId) {
      throw new AppException(
        'You do not have a merchant scope.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.forbidden },
      );
    }
    return merchantId;
  }
}
