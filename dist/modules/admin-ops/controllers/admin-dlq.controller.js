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
exports.AdminDlqController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const dlq_service_1 = require("../../../infrastructure/queue/dlq.service");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
let AdminDlqController = class AdminDlqController {
    constructor(dlqService, queueService) {
        this.dlqService = dlqService;
        this.queueService = queueService;
    }
    async list(queueName, jobName) {
        return this.dlqService.list(queueName, jobName);
    }
    async count(queueName, jobName) {
        return { count: await this.dlqService.count(queueName, jobName) };
    }
    async retry(queueName, jobName, jobId) {
        const entries = await this.dlqService.list(queueName, jobName);
        const entry = entries.find((e) => e.id === jobId);
        if (entry === undefined) {
            throw new common_1.NotFoundException(`DLQ entry ${jobId} not found.`);
        }
        await this.queueService.add(queueName, jobName, entry.payload);
        await this.dlqService.remove(queueName, jobName, jobId);
        return entry;
    }
    async remove(queueName, jobName, jobId) {
        const removed = await this.dlqService.remove(queueName, jobName, jobId);
        if (!removed) {
            throw new common_1.NotFoundException(`DLQ entry ${jobId} not found.`);
        }
    }
    async prune() {
        return { removed: await this.dlqService.pruneExpired() };
    }
};
exports.AdminDlqController = AdminDlqController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminListDlqJobs',
        summary: 'List all dead-letter queue jobs with optional queue/job filter',
    }),
    (0, swagger_1.ApiQuery)({ name: 'queueName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'jobName', required: false }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns DLQ entries, newest first.' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('queueName')),
    __param(1, (0, common_1.Query)('jobName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminDlqController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminGetDlqCount',
        summary: 'Count dead-letter queue jobs',
    }),
    (0, swagger_1.ApiQuery)({ name: 'queueName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'jobName', required: false }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns total DLQ job count.' }),
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)('queueName')),
    __param(1, (0, common_1.Query)('jobName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminDlqController.prototype, "count", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminRetryDlqJob',
        summary: 'Re-enqueue a failed job from the DLQ back into its original queue',
    }),
    (0, swagger_1.ApiParam)({ name: 'queueName' }),
    (0, swagger_1.ApiParam)({ name: 'jobName' }),
    (0, swagger_1.ApiParam)({ name: 'jobId' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Job re-enqueued into the original queue.' }),
    (0, common_1.Post)(':queueName/:jobName/:jobId/retry'),
    __param(0, (0, common_1.Param)('queueName')),
    __param(1, (0, common_1.Param)('jobName')),
    __param(2, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDlqController.prototype, "retry", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminDeleteDlqJob',
        summary: 'Permanently delete a job from the DLQ',
    }),
    (0, swagger_1.ApiParam)({ name: 'queueName' }),
    (0, swagger_1.ApiParam)({ name: 'jobName' }),
    (0, swagger_1.ApiParam)({ name: 'jobId' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':queueName/:jobName/:jobId'),
    __param(0, (0, common_1.Param)('queueName')),
    __param(1, (0, common_1.Param)('jobName')),
    __param(2, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDlqController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminPruneDlqJobs',
        summary: 'Prune DLQ entries older than 30 days',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns number of entries removed.' }),
    (0, common_1.Post)('prune'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDlqController.prototype, "prune", null);
exports.AdminDlqController = AdminDlqController = __decorate([
    (0, swagger_1.ApiTags)('admin-dlq'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/queue/dlq'),
    __metadata("design:paramtypes", [dlq_service_1.DlqService,
        queue_service_1.QueueService])
], AdminDlqController);
//# sourceMappingURL=admin-dlq.controller.js.map