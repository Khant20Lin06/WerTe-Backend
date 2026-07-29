import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOperationalSummaryDto } from '../dto/rider-operational-summary.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import {
  RiderWeeklyScheduleDto,
  UpdateRiderWeeklyScheduleDto,
} from '../dto/rider-weekly-schedule.dto';
import {
  RiderDocumentDto,
  UploadRiderDocumentParamsDto,
} from '../dto/rider-document.dto';
import {
  RiderPayoutMethodDto,
  UpdateRiderPayoutMethodDto,
} from '../dto/rider-payout-method.dto';
import { RiderAccountService } from '../services/rider-account.service';

@ApiTags('rider-profile')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/profile')
export class RiderProfileController {
  constructor(private readonly riderAccountService: RiderAccountService) {}

  @ApiOperation({
    operationId: 'getRiderProfile',
    summary: 'Return the authenticated rider profile',
  })
  @ApiOkResponse({
    description: 'Returns the rider profile owned by the authenticated rider.',
    type: RiderProfileDto,
  })
  @Get()
  getCurrentProfile(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getCurrentRiderProfile(currentUser);
  }

  @ApiOperation({
    operationId: 'updateRiderProfile',
    summary: 'Update the authenticated rider profile',
  })
  @ApiBody({ type: UpdateRiderProfileDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated rider profile.',
    type: RiderProfileDto,
  })
  @Patch()
  updateCurrentProfile(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateRiderProfileDto,
  ) {
    return this.riderAccountService.updateCurrentRiderProfile(currentUser, body);
  }

  @ApiOperation({
    operationId: 'getRiderOperationalSummary',
    summary: 'Return the operational summary for the authenticated rider',
  })
  @ApiOkResponse({
    description:
      'Returns rider operational fields that later dispatch and availability flows can bootstrap from.',
    type: RiderOperationalSummaryDto,
  })
  @Get('operational-summary')
  getOperationalSummary(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getOperationalSummary(currentUser);
  }

  @ApiOperation({
    operationId: 'getRiderWeeklySchedule',
    summary: 'Return the authenticated rider weekly availability schedule',
  })
  @ApiOkResponse({
    description:
      'Returns the recurring weekly working-hours schedule for the authenticated rider.',
    type: RiderWeeklyScheduleDto,
  })
  @Get('schedule')
  getWeeklySchedule(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getCurrentRiderWeeklySchedule(currentUser);
  }

  @ApiOperation({
    operationId: 'updateRiderWeeklySchedule',
    summary: 'Update the authenticated rider weekly availability schedule',
  })
  @ApiBody({ type: UpdateRiderWeeklyScheduleDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated rider weekly schedule.',
    type: RiderWeeklyScheduleDto,
  })
  @Patch('schedule')
  updateWeeklySchedule(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateRiderWeeklyScheduleDto,
  ) {
    return this.riderAccountService.updateCurrentRiderWeeklySchedule(
      currentUser,
      body,
    );
  }

  @ApiOperation({
    operationId: 'getRiderDocuments',
    summary: 'List the authenticated rider verification documents',
  })
  @ApiOkResponse({
    description: 'Returns all uploaded documents for the authenticated rider.',
    type: [RiderDocumentDto],
  })
  @Get('documents')
  getDocuments(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getCurrentRiderDocuments(currentUser);
  }

  @ApiOperation({
    operationId: 'uploadRiderDocument',
    summary: 'Upload (or replace) a rider verification document',
  })
  @ApiParam({ name: 'type', enum: ['DRIVERS_LICENSE', 'NATIONAL_ID', 'VEHICLE_REGISTRATION', 'INSURANCE'] })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (jpeg/png/webp, max 10 MB)' },
      },
    },
  })
  @ApiCreatedResponse({ type: RiderDocumentDto })
  @Post('documents/:type')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param() params: UploadRiderDocumentParamsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.riderAccountService.uploadCurrentRiderDocument(
      currentUser,
      params.type,
      file,
    );
  }

  @ApiOperation({
    operationId: 'getRiderPayoutMethod',
    summary: 'Return the authenticated rider payout method, if configured',
  })
  @ApiOkResponse({
    description:
      'Returns the payout method for the authenticated rider, or null if not set up yet.',
    type: RiderPayoutMethodDto,
  })
  @Get('payout-method')
  getPayoutMethod(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getCurrentRiderPayoutMethod(currentUser);
  }

  @ApiOperation({
    operationId: 'updateRiderPayoutMethod',
    summary: 'Create or replace the authenticated rider payout method',
  })
  @ApiBody({ type: UpdateRiderPayoutMethodDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated rider payout method.',
    type: RiderPayoutMethodDto,
  })
  @Patch('payout-method')
  updatePayoutMethod(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateRiderPayoutMethodDto,
  ) {
    return this.riderAccountService.updateCurrentRiderPayoutMethod(
      currentUser,
      body,
    );
  }
}
