import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../menus/services/menu-inventory-lifecycle.service';
import { PaymentSummaryEntity } from '../entities/payment-summary.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
type PaymentLifecycleInput = {
    paymentId: string;
    providerReference?: string | null;
    providerReceiptId?: string | null;
    reasonCode?: string | null;
    note?: string | null;
    failureCode?: string | null;
    failureMessage?: string | null;
    metadata?: Prisma.InputJsonValue;
    requestPayloadJson?: Prisma.InputJsonValue;
    responsePayloadJson?: Prisma.InputJsonValue;
};
type PaymentLifecycleOptions = {
    skipAdminFinanceAccess?: boolean;
};
export declare class PaymentLifecycleService {
    private readonly prisma;
    private readonly paymentsRepository;
    private readonly ordersRepository;
    private readonly systemMessageService;
    private readonly menuInventoryLifecycleService;
    private readonly notificationEventService;
    constructor(prisma: PrismaService, paymentsRepository: PaymentsRepository, ordersRepository: OrdersRepository, systemMessageService: SystemMessageService, menuInventoryLifecycleService: MenuInventoryLifecycleService, notificationEventService: NotificationEventService);
    confirmCurrentPayment(currentUser: AuthenticatedUserEntity, input: PaymentLifecycleInput, options?: PaymentLifecycleOptions): Promise<PaymentSummaryEntity>;
    failCurrentPayment(currentUser: AuthenticatedUserEntity, input: PaymentLifecycleInput, options?: PaymentLifecycleOptions): Promise<PaymentSummaryEntity>;
    cancelCurrentPayment(currentUser: AuthenticatedUserEntity, input: PaymentLifecycleInput, options?: PaymentLifecycleOptions): Promise<PaymentSummaryEntity>;
    expireCurrentPayment(currentUser: AuthenticatedUserEntity, input: PaymentLifecycleInput, options?: PaymentLifecycleOptions): Promise<PaymentSummaryEntity>;
    private handleTransition;
    private shouldAutoCancelOrder;
    private publishSystemMessages;
    private publishRestoredInventoryAlerts;
    private buildMergedMetadata;
}
export {};
