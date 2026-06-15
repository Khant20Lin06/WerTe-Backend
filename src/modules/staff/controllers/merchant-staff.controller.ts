import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffMemberDto, toStaffMemberDto } from '../dto/staff-member.dto';
import { StaffService } from '../services/staff.service';

@ApiTags('merchant-staff')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/staff')
export class MerchantStaffController {
  constructor(private readonly staffService: StaffService) {}

  @ApiOperation({ operationId: 'listMerchantStaff', summary: 'List all staff members' })
  @ApiOkResponse({ type: StaffMemberDto, isArray: true })
  @Get()
  async list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    const staff = await this.staffService.listStaff(currentUser);
    return staff.map(toStaffMemberDto);
  }

  @ApiOperation({ operationId: 'inviteMerchantStaff', summary: 'Invite a new staff member' })
  @ApiBody({ type: InviteStaffDto })
  @ApiOkResponse({ type: StaffMemberDto })
  @Post()
  async invite(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: InviteStaffDto,
  ) {
    const staff = await this.staffService.inviteStaff(currentUser, body);
    return toStaffMemberDto(staff);
  }

  @ApiOperation({ operationId: 'updateMerchantStaff', summary: 'Update staff role, status or branch assignments' })
  @ApiBody({ type: UpdateStaffDto })
  @ApiOkResponse({ type: StaffMemberDto })
  @Patch(':staffId')
  async update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('staffId') staffId: string,
    @Body() body: UpdateStaffDto,
  ) {
    const staff = await this.staffService.updateStaff(currentUser, staffId, body);
    return toStaffMemberDto(staff);
  }

  @ApiOperation({ operationId: 'removeMerchantStaff', summary: 'Remove a staff member' })
  @ApiNoContentResponse({ description: 'Staff member removed.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':staffId')
  remove(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('staffId') staffId: string,
  ) {
    return this.staffService.removeStaff(currentUser, staffId);
  }
}
