import { RiderOwnershipEntity, RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import { RidersRepository } from '../repositories/riders.repository';
export declare class RidersService {
    private readonly ridersRepository;
    constructor(ridersRepository: RidersRepository);
    findById(id: string): Promise<RiderOwnershipRecord | null>;
    findByUserId(userId: string): Promise<RiderOwnershipRecord | null>;
    findOwnedByUserId(userId: string, riderId: string): Promise<RiderOwnershipRecord | null>;
    buildOwnership(rider: RiderOwnershipRecord): RiderOwnershipEntity;
    belongsToUser(rider: RiderOwnershipRecord, userId: string): boolean;
}
