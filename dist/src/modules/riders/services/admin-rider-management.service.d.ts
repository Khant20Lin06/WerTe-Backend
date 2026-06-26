import { RiderStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RiderProfileDto } from '../dto/rider-profile.dto';
export declare class AdminRiderManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listRiders(status?: RiderStatus): Promise<RiderProfileDto[]>;
    updateRiderStatus(riderId: string, status: Exclude<RiderStatus, 'PENDING'>): Promise<RiderProfileDto>;
}
