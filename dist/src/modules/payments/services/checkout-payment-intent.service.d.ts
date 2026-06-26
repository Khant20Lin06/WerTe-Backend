import { PaymentMethod, PaymentProvider, Prisma } from '@prisma/client';
import { CheckoutPaymentIntentEntity } from '../entities/checkout-payment-intent.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
type PaymentDatabaseClient = Prisma.TransactionClient | undefined;
export type CreateCheckoutPaymentIntentInput = {
    orderId: string;
    orderCode: string;
    customerProfileId: string;
    amount: Prisma.Decimal;
    currencyCode: string;
    idempotencyKey: string;
    paymentMethod?: PaymentMethod;
    paymentProvider?: PaymentProvider;
};
export declare class CheckoutPaymentIntentService {
    private readonly paymentsRepository;
    constructor(paymentsRepository: PaymentsRepository);
    findByIdempotencyKey(idempotencyKey: string, client?: PaymentDatabaseClient): Promise<CheckoutPaymentIntentEntity | null>;
    createCheckoutPaymentIntent(input: CreateCheckoutPaymentIntentInput, client?: PaymentDatabaseClient): Promise<CheckoutPaymentIntentEntity>;
    private resolvePaymentProfile;
}
export {};
