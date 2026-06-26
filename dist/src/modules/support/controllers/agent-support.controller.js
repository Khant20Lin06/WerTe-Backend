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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSupportController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const list_support_tickets_query_dto_1 = require("../dto/list-support-tickets-query.dto");
const reply_support_ticket_dto_1 = require("../dto/reply-support-ticket.dto");
const update_support_ticket_dto_1 = require("../dto/update-support-ticket.dto");
const support_ticket_entity_1 = require("../entities/support-ticket.entity");
const support_tickets_service_1 = require("../services/support-tickets.service");
let AgentSupportController = class AgentSupportController {
    constructor(service) {
        this.service = service;
    }
    listTickets(currentUser, query) {
        return this.service.listAgentTickets(currentUser, query);
    }
    getTicket(currentUser, ticketId) {
        return this.service.getTicket(currentUser, ticketId);
    }
    updateTicket(currentUser, ticketId, dto) {
        return this.service.updateTicket(currentUser, ticketId, dto);
    }
    reply(currentUser, ticketId, dto) {
        return this.service.replyToTicket(currentUser, ticketId, dto);
    }
};
exports.AgentSupportController = AgentSupportController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all support tickets (agent/admin view)' }),
    (0, swagger_1.ApiOkResponse)({ type: [support_ticket_entity_1.SupportTicketEntity] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_support_tickets_query_dto_1.ListSupportTicketsQueryDto]),
    __metadata("design:returntype", void 0)
], AgentSupportController.prototype, "listTickets", null);
__decorate([
    (0, common_1.Get)(':ticketId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a support ticket with full message history' }),
    (0, swagger_1.ApiOkResponse)({ type: support_ticket_entity_1.SupportTicketEntity }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ticketId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AgentSupportController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Patch)(':ticketId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status, priority, or assignment' }),
    (0, swagger_1.ApiOkResponse)({ type: support_ticket_entity_1.SupportTicketEntity }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ticketId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_support_ticket_dto_1.UpdateSupportTicketDto]),
    __metadata("design:returntype", void 0)
], AgentSupportController.prototype, "updateTicket", null);
__decorate([
    (0, common_1.Post)(':ticketId/messages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Reply to a ticket (supports internal notes)' }),
    (0, swagger_1.ApiCreatedResponse)({ type: support_ticket_entity_1.SupportTicketMessageEntity }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ticketId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, reply_support_ticket_dto_1.ReplySupportTicketDto]),
    __metadata("design:returntype", void 0)
], AgentSupportController.prototype, "reply", null);
exports.AgentSupportController = AgentSupportController = __decorate([
    (0, swagger_1.ApiTags)('support-agent'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPPORT, client_1.UserRole.ADMIN),
    (0, common_1.Controller)('support/tickets'),
    __metadata("design:paramtypes", [support_tickets_service_1.SupportTicketsService])
], AgentSupportController);
//# sourceMappingURL=agent-support.controller.js.map