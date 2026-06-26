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
exports.SupportTicketsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TICKET_SEQ_KEY = 'support:ticket:seq';
let SupportTicketsRepository = class SupportTicketsRepository {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async create(data) {
        return this.prisma.supportTicket.create({
            data: {
                ticketNumber: data.ticketNumber,
                customerId: data.customerId,
                orderId: data.orderId ?? null,
                category: data.category,
                priority: data.priority,
                status: client_1.SupportTicketStatus.OPEN,
                subject: data.subject,
                messages: {
                    create: {
                        senderUserId: data.customerId,
                        body: data.firstMessageBody,
                        isInternal: false,
                    },
                },
                statusHistory: {
                    create: {
                        toStatus: client_1.SupportTicketStatus.OPEN,
                    },
                },
            },
        });
    }
    async findById(id, includeMessages = false) {
        return this.prisma.supportTicket.findUnique({
            where: { id },
            include: includeMessages ? { messages: { orderBy: { createdAt: 'asc' } } } : undefined,
        });
    }
    async findByTicketNumber(ticketNumber) {
        return this.prisma.supportTicket.findUnique({ where: { ticketNumber } });
    }
    async listByCustomer(customerId, filters) {
        const where = {
            customerId,
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.category ? { category: filters.category } : {}),
        };
        const [tickets, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { tickets, total };
    }
    async listForAgent(filters) {
        const where = {
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(filters.priority ? { priority: filters.priority } : {}),
            ...(filters.assignedAgentId !== undefined
                ? { assignedAgentId: filters.assignedAgentId }
                : {}),
        };
        const [tickets, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { tickets, total };
    }
    async update(id, data, statusHistoryEntry) {
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.supportTicket.update({ where: { id }, data });
            if (statusHistoryEntry) {
                await tx.supportTicketStatusHistory.create({ data: { ticketId: id, ...statusHistoryEntry } });
            }
            return ticket;
        });
    }
    async addMessage(data) {
        return this.prisma.supportTicketMessage.create({ data });
    }
    async listMessages(ticketId) {
        return this.prisma.supportTicketMessage.findMany({
            where: { ticketId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async generateTicketNumber() {
        const date = new Date();
        const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const seq = await this.redis.incr(`${TICKET_SEQ_KEY}:${ymd}`);
        return `TKT-${ymd}-${String(seq).padStart(4, '0')}`;
    }
};
exports.SupportTicketsRepository = SupportTicketsRepository;
exports.SupportTicketsRepository = SupportTicketsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], SupportTicketsRepository);
//# sourceMappingURL=support-tickets.repository.js.map