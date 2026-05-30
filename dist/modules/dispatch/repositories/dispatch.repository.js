"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const dispatch_queue_entry_entity_1 = require("../entities/dispatch-queue-entry.entity");
let DispatchRepository = class DispatchRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findQueueEntries(limit = 50) {
        return this.prisma.order.findMany({
            where: {
                OR: [
                    {
                        status: client_1.OrderStatus.PREPARING,
                    },
                    {
                        status: client_1.OrderStatus.RIDER_ASSIGNED,
                        delivery: {
                            is: {
                                status: {
                                    in: [client_1.DeliveryStatus.ASSIGNED, client_1.DeliveryStatus.PENDING_ASSIGNMENT],
                                },
                            },
                        },
                    },
                ],
            },
            include: dispatch_queue_entry_entity_1.dispatchQueueOrderInclude,
            orderBy: [{ placedAt: 'asc' }, { id: 'asc' }],
            take: limit,
        });
    }
    findQueueEntryByOrderId(orderId) {
        return this.prisma.order.findFirst({
            where: {
                id: orderId,
                OR: [
                    {
                        status: client_1.OrderStatus.PREPARING,
                    },
                    {
                        status: client_1.OrderStatus.RIDER_ASSIGNED,
                        delivery: {
                            is: {
                                status: {
                                    in: [client_1.DeliveryStatus.ASSIGNED, client_1.DeliveryStatus.PENDING_ASSIGNMENT],
                                },
                            },
                        },
                    },
                ],
            },
            include: dispatch_queue_entry_entity_1.dispatchQueueOrderInclude,
        });
    }
};
exports.DispatchRepository = DispatchRepository;
exports.DispatchRepository = DispatchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DispatchRepository);
//# sourceMappingURL=dispatch.repository.js.map