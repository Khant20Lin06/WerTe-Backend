import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { IngestRiderLocationDto } from '../dto/ingest-rider-location.dto';
import { RiderLocationDto } from '../dto/rider-location.dto';
import { RidersRepository } from '../repositories/riders.repository';
import { RiderAccountService } from './rider-account.service';
export declare class RiderLocationService {
    private readonly prisma;
    private readonly riderAccountService;
    private readonly ridersRepository;
    private readonly deliveriesRepository;
    constructor(prisma: PrismaService, riderAccountService: RiderAccountService, ridersRepository: RidersRepository, deliveriesRepository: DeliveriesRepository);
    ingestCurrentRiderLocation(currentUser: AuthenticatedUserEntity, payload: IngestRiderLocationDto): Promise<RiderLocationDto>;
    private toRiderLocationDto;
}
