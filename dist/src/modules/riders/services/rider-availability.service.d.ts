import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderAvailabilityDto } from '../dto/rider-availability.dto';
import { RidersRepository } from '../repositories/riders.repository';
import { RiderAccountService } from './rider-account.service';
export declare class RiderAvailabilityService {
    private readonly riderAccountService;
    private readonly ridersRepository;
    private readonly queueService;
    constructor(riderAccountService: RiderAccountService, ridersRepository: RidersRepository, queueService: QueueService);
    getCurrentAvailability(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
    markCurrentRiderOnline(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
    markCurrentRiderOffline(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
    private assertCanGoOnline;
}
