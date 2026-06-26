import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { PaymentsRepository } from '../../payments/repositories/payments.repository';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';
import { RefundsRepository } from '../repositories/refunds.repository';
type RequestRefundInput = {
    paymentId: string;
    amount: string;
    idempotencyKey?: string | null;
    providerReference?: string | null;
    reasonCode?: string | null;
    note?: string | null;
    metadata?: Prisma.InputJsonValue;
    requestPayloadJson?: Prisma.InputJsonValue;
    responsePayloadJson?: Prisma.InputJsonValue;
};
type FinalizeRefundInput = {
    refundId: string;
    providerReference?: string | null;
    reasonCode?: string | null;
    note?: string | null;
    failureCode?: string | null;
    failureMessage?: string | null;
    metadata?: Prisma.InputJsonValue;
    requestPayloadJson?: Prisma.InputJsonValue;
    responsePayloadJson?: Prisma.InputJsonValue;
};
type RefundLifecycleOptions = {
    skipAdminFinanceAccess?: boolean;
};
export declare class RefundOperationsService {
    private readonly prisma;
    private readonly paymentsRepository;
    private readonly refundsRepository;
    private readonly systemMessageService;
    constructor(prisma: PrismaService, paymentsRepository: PaymentsRepository, refundsRepository: RefundsRepository, systemMessageService: SystemMessageService);
    requestCurrentAdminRefund(currentUser: AuthenticatedUserEntity, input: RequestRefundInput): Promise<RefundSummaryEntity>;
    succeedCurrentAdminRefund(currentUser: AuthenticatedUserEntity, input: FinalizeRefundInput, options?: RefundLifecycleOptions): Promise<RefundSummaryEntity>;
    failCurrentAdminRefund(currentUser: AuthenticatedUserEntity, input: FinalizeRefundInput, options?: RefundLifecycleOptions): Promise<RefundSummaryEntity>;
    cancelCurrentAdminRefund(currentUser: AuthenticatedUserEntity, input: FinalizeRefundInput, options?: RefundLifecycleOptions): Promise<RefundSummaryEntity>;
    private finalizeRefund;
    private publishRefundEvent;
    private computeAvailableRefundableAmount;
    private computeSucceededRefundAmount;
    private parsePositiveAmount;
    private requireAdmin;
    private buildMergedMetadata;
    private asJsonObject;
}
export {};
