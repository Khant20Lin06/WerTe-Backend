import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, RiderStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  riderOwnershipInclude,
  RiderOwnershipRecord,
} from '../entities/rider-ownership.entity';
import { RiderProfileDto, toRiderProfileDto } from '../dto/rider-profile.dto';

@Injectable()
export class AdminRiderManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async listRiders(status?: RiderStatus): Promise<RiderProfileDto[]> {
    const where: Prisma.RiderWhereInput = status ? { status } : {};
    const riders = await this.prisma.rider.findMany({
      where,
      include: riderOwnershipInclude,
      orderBy: { createdAt: 'desc' },
    });
    return riders.map(toRiderProfileDto);
  }

  async updateRiderStatus(
    riderId: string,
    status: Exclude<RiderStatus, 'PENDING'>,
  ): Promise<RiderProfileDto> {
    const existing = await this.prisma.rider.findUnique({
      where: { id: riderId },
      include: riderOwnershipInclude,
    });

    if (existing === null) {
      throw new AppException(
        `Rider '${riderId}' was not found.`,
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.notFound },
      );
    }

    const updated: RiderOwnershipRecord = await this.prisma.rider.update({
      where: { id: riderId },
      data: { status },
      include: riderOwnershipInclude,
    });

    return toRiderProfileDto(updated);
  }
}
