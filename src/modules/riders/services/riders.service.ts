import { Injectable } from '@nestjs/common';

import {
  buildRiderOwnership,
  RiderOwnershipEntity,
  RiderOwnershipRecord,
} from '../entities/rider-ownership.entity';
import { RidersRepository } from '../repositories/riders.repository';

@Injectable()
export class RidersService {
  constructor(private readonly ridersRepository: RidersRepository) {}

  findById(id: string): Promise<RiderOwnershipRecord | null> {
    return this.ridersRepository.findById(id);
  }

  findByUserId(userId: string): Promise<RiderOwnershipRecord | null> {
    return this.ridersRepository.findByUserId(userId);
  }

  async findOwnedByUserId(
    userId: string,
    riderId: string,
  ): Promise<RiderOwnershipRecord | null> {
    const rider = await this.findById(riderId);
    if (rider === null || !this.belongsToUser(rider, userId)) {
      return null;
    }

    return rider;
  }

  buildOwnership(rider: RiderOwnershipRecord): RiderOwnershipEntity {
    return buildRiderOwnership(rider);
  }

  belongsToUser(rider: RiderOwnershipRecord, userId: string): boolean {
    return rider.user.id === userId;
  }
}
