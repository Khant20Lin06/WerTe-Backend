import { DlqEntry, DlqService } from '../../../infrastructure/queue/dlq.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
export declare class AdminDlqController {
    private readonly dlqService;
    private readonly queueService;
    constructor(dlqService: DlqService, queueService: QueueService);
    list(queueName?: string, jobName?: string): Promise<DlqEntry[]>;
    count(queueName?: string, jobName?: string): Promise<{
        count: number;
    }>;
    retry(queueName: string, jobName: string, jobId: string): Promise<DlqEntry>;
    remove(queueName: string, jobName: string, jobId: string): Promise<void>;
    prune(): Promise<{
        removed: number;
    }>;
}
