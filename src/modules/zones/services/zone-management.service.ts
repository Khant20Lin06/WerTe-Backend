import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateZoneDto } from '../dto/create-zone.dto';
import { toZoneDto, ZoneDto } from '../dto/zone.dto';
import { UpdateZoneDto } from '../dto/update-zone.dto';
import { ZonePolicyService } from '../policies/zone-policy.service';
import { ZonesRepository } from '../repositories/zones.repository';

@Injectable()
export class ZoneManagementService {
  constructor(
    private readonly zonesRepository: ZonesRepository,
    private readonly zonePolicyService: ZonePolicyService,
  ) {}

  async listZones(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]> {
    this.assertCanManageZones(currentUser);

    const zones = await this.zonesRepository.listAll();

    return zones.map((zone) => toZoneDto(zone));
  }

  async getZone(
    currentUser: AuthenticatedUserEntity,
    zoneId: string,
  ): Promise<ZoneDto> {
    this.assertCanManageZones(currentUser);

    const zone = await this.zonesRepository.findManagementById(zoneId);
    if (zone === null) {
      throw new AppException('Zone was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return toZoneDto(zone);
  }

  async createZone(
    currentUser: AuthenticatedUserEntity,
    payload: CreateZoneDto,
  ): Promise<ZoneDto> {
    this.assertCanManageZones(currentUser);
    await this.assertCodeAvailable(payload.code);

    const zone = await this.zonesRepository.create({
      code: payload.code,
      name: payload.name,
      description: payload.description,
      status: payload.status,
    });

    return toZoneDto(zone);
  }

  async updateZone(
    currentUser: AuthenticatedUserEntity,
    zoneId: string,
    payload: UpdateZoneDto,
  ): Promise<ZoneDto> {
    this.assertCanManageZones(currentUser);

    const existingZone = await this.zonesRepository.findManagementById(zoneId);
    if (existingZone === null) {
      throw new AppException('Zone was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      payload.code !== undefined &&
      payload.code.length > 0 &&
      payload.code !== existingZone.code
    ) {
      await this.assertCodeAvailable(payload.code, existingZone.id);
    }

    const updatedZone = await this.zonesRepository.update(zoneId, {
      ...(payload.code !== undefined ? { code: payload.code } : {}),
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
    });

    return toZoneDto(updatedZone);
  }

  async listActiveZones(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]> {
    if (!this.zonePolicyService.canReadActiveZones(currentUser)) {
      throw new AppException(
        'You are not allowed to read active zones.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const zones = await this.zonesRepository.listActive();

    return zones.map((zone) => toZoneDto(zone));
  }

  private assertCanManageZones(currentUser: AuthenticatedUserEntity) {
    if (!this.zonePolicyService.canManageZones(currentUser)) {
      throw new AppException(
        'You are not allowed to manage zones.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private async assertCodeAvailable(code: string, currentZoneId?: string) {
    const existingZone = await this.zonesRepository.findManagementByCode(code);
    if (existingZone !== null && existingZone.id !== currentZoneId) {
      throw new AppException(
        'Zone code is already in use.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
          details: {
            code,
          },
        },
      );
    }
  }
}
