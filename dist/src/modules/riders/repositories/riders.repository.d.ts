import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RiderCurrentLocation, RiderLocationHistory, RiderOwnershipRecord } from '../entities/rider-ownership.entity';
type RiderDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class RidersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<RiderOwnershipRecord | null>;
    findByUserId(userId: string): Promise<RiderOwnershipRecord | null>;
    findEligibleRiders(options?: {
        township?: string | null;
    }): Promise<RiderOwnershipRecord[]>;
    update(id: string, data: Prisma.RiderUpdateInput, client?: RiderDatabaseClient): Promise<RiderOwnershipRecord>;
    upsertAvailability(riderId: string, data: {
        isOnline: boolean;
        isAvailable: boolean;
        lastStatusChangedAt: Date;
    }, client?: RiderDatabaseClient): Promise<RiderOwnershipRecord>;
    findCurrentLocationByRiderId(riderId: string, client?: RiderDatabaseClient): Promise<RiderCurrentLocation | null>;
    upsertCurrentLocation(riderId: string, data: {
        deliveryId: string | null;
        latitude: Prisma.Decimal | number | string;
        longitude: Prisma.Decimal | number | string;
        heading?: Prisma.Decimal | number | string | null;
        speed?: Prisma.Decimal | number | string | null;
        accuracyMeters?: Prisma.Decimal | number | string | null;
        recordedAt: Date;
    }, client?: RiderDatabaseClient): Promise<RiderCurrentLocation>;
    createLocationHistory(riderId: string, data: {
        deliveryId: string | null;
        latitude: Prisma.Decimal | number | string;
        longitude: Prisma.Decimal | number | string;
        heading?: Prisma.Decimal | number | string | null;
        speed?: Prisma.Decimal | number | string | null;
        accuracyMeters?: Prisma.Decimal | number | string | null;
        recordedAt: Date;
    }, client?: RiderDatabaseClient): Promise<RiderLocationHistory>;
}
export {};
