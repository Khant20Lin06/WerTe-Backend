import { DispatchQueueEntryEntity, DispatchQueueEntryRecord } from '../entities/dispatch-queue-entry.entity';
import { DispatchRepository } from '../repositories/dispatch.repository';
export declare class DispatchQueryService {
    private readonly dispatchRepository;
    constructor(dispatchRepository: DispatchRepository);
    buildDispatchQueueEntry(entry: DispatchQueueEntryRecord): DispatchQueueEntryEntity;
    listQueueEntries(): Promise<DispatchQueueEntryEntity[]>;
    getQueueEntry(orderId: string): Promise<DispatchQueueEntryEntity>;
}
