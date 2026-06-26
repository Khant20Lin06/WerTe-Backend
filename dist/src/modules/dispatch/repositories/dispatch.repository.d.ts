import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DispatchQueueEntryRecord } from '../entities/dispatch-queue-entry.entity';
export declare class DispatchRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findQueueEntries(limit?: number): Promise<DispatchQueueEntryRecord[]>;
    findQueueEntryByOrderId(orderId: string): Promise<DispatchQueueEntryRecord | null>;
    findReadyOrdersWithoutRider(options?: {
        township?: string | null;
        limit?: number;
    }): Promise<DispatchQueueEntryRecord[]>;
}
