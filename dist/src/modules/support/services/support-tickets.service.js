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
exports.SupportTicketsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const support_tickets_repository_1 = require("../repositories/support-tickets.repository");
const TERMINAL_STATUSES = [
    client_1.SupportTicketStatus.RESOLVED,
    client_1.SupportTicketStatus.CLOSED,
];
let SupportTicketsService = class SupportTicketsService {
    constructor(repo) {
        this.repo = repo;
    }
    async createTicket(currentUser, dto) {
        const ticketNumber = await this.repo.generateTicketNumber();
        return this.repo.create({
            ticketNumber,
            customerId: currentUser.userId,
            orderId: dto.orderId,
            category: dto.category,
            priority: dto.priority ?? client_1.SupportTicketPriority.NORMAL,
            subject: dto.subject,
            firstMessageBody: dto.body,
        });
    }
    async listCustomerTickets(currentUser, query) {
        return this.repo.listByCustomer(currentUser.userId, {
            status: query.status,
            category: query.category,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        });
    }
    async getTicket(currentUser, ticketId) {
        const ticket = await this.repo.findById(ticketId, true);
        this.assertTicketAccess(currentUser, ticket, ticketId);
        return ticket;
    }
    async replyToTicket(currentUser, ticketId, dto) {
        const ticket = await this.repo.findById(ticketId);
        this.assertTicketAccess(currentUser, ticket, ticketId);
        if (TERMINAL_STATUSES.includes(ticket.status)) {
            throw new app_exception_1.AppException('Cannot reply to a resolved or closed ticket.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const isAgent = currentUser.role === client_1.UserRole.SUPPORT || currentUser.role === client_1.UserRole.ADMIN;
        const isInternal = isAgent && (dto.isInternal ?? false);
        const shouldReopen = !isAgent && ticket.status === client_1.SupportTicketStatus.PENDING_CUSTOMER;
        const message = await this.repo.addMessage({
            ticketId,
            senderUserId: currentUser.userId,
            body: dto.body,
            isInternal,
            storageKey: dto.storageKey,
        });
        if (shouldReopen) {
            await this.repo.update(ticketId, { status: client_1.SupportTicketStatus.IN_PROGRESS }, {
                fromStatus: client_1.SupportTicketStatus.PENDING_CUSTOMER,
                toStatus: client_1.SupportTicketStatus.IN_PROGRESS,
                changedByUserId: currentUser.userId,
                note: 'Customer replied.',
            });
        }
        return message;
    }
    async updateTicket(currentUser, ticketId, dto) {
        const ticket = await this.repo.findById(ticketId);
        if (!ticket) {
            throw new app_exception_1.AppException('Support ticket not found.', common_1.HttpStatus.NOT_FOUND);
        }
        const updateData = {};
        let statusHistoryEntry;
        if (dto.status && dto.status !== ticket.status) {
            updateData.status = dto.status;
            if (dto.status === client_1.SupportTicketStatus.RESOLVED)
                updateData.resolvedAt = new Date();
            if (dto.status === client_1.SupportTicketStatus.CLOSED)
                updateData.closedAt = new Date();
            statusHistoryEntry = {
                fromStatus: ticket.status,
                toStatus: dto.status,
                changedByUserId: currentUser.userId,
                note: dto.note,
            };
        }
        if (dto.priority)
            updateData.priority = dto.priority;
        if (dto.assignedAgentId !== undefined)
            updateData.assignedAgentId = dto.assignedAgentId;
        return this.repo.update(ticketId, updateData, statusHistoryEntry);
    }
    async listAgentTickets(currentUser, query) {
        return this.repo.listForAgent({
            status: query.status,
            category: query.category,
            priority: query.priority,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        });
    }
    assertTicketAccess(currentUser, ticket, ticketId) {
        if (!ticket) {
            throw new app_exception_1.AppException('Support ticket not found.', common_1.HttpStatus.NOT_FOUND);
        }
        const isAgent = currentUser.role === client_1.UserRole.SUPPORT || currentUser.role === client_1.UserRole.ADMIN;
        if (!isAgent && ticket.customerId !== currentUser.userId) {
            throw new app_exception_1.AppException('Access denied.', common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.SupportTicketsService = SupportTicketsService;
exports.SupportTicketsService = SupportTicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [support_tickets_repository_1.SupportTicketsRepository])
], SupportTicketsService);
//# sourceMappingURL=support-tickets.service.js.map