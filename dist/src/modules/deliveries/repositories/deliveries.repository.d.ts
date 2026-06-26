import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DeliveryDetailRecord } from '../entities/delivery-detail.entity';
type DeliveryDatabaseClient = PrismaService | Prisma.TransactionClient;
export declare class DeliveriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(deliveryId: string, client?: DeliveryDatabaseClient): Promise<DeliveryDetailRecord | null>;
    findByOrderId(orderId: string, client?: DeliveryDatabaseClient): Promise<DeliveryDetailRecord | null>;
    findRiderActiveDelivery(riderId: string): Promise<DeliveryDetailRecord | null>;
    findRiderDeliveryById(deliveryId: string, riderId: string, client?: DeliveryDatabaseClient): Promise<DeliveryDetailRecord | null>;
    updateById(deliveryId: string, data: Prisma.DeliveryUpdateInput, client?: DeliveryDatabaseClient): Promise<DeliveryDetailRecord>;
    upsertAssignedDelivery(orderId: string, payload: {
        riderId: string;
        etaMinutes: number | null;
        assignedAt: Date;
    }, client?: DeliveryDatabaseClient): Promise<DeliveryDetailRecord>;
}
export {};
