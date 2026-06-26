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
exports.OrderTimeoutJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const orders_repository_1 = require("../modules/orders/repositories/orders.repository");
let OrderTimeoutJob = class OrderTimeoutJob {
    constructor(queueService, ordersRepository, logger) {
        this.queueService = queueService;
        this.ordersRepository = ordersRepository;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.orderTimeouts, queue_constants_1.QueueJobNames.orderTimeouts.startTimeout, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const order = await this.ordersRepository.findOrderDetailById(payload.orderId);
        this.logger.logEvent('Order timeout baseline job processed.', {
            orderId: payload.orderId,
            status: order?.status ?? 'missing',
        }, 'OrderTimeoutJob');
    }
};
exports.OrderTimeoutJob = OrderTimeoutJob;
exports.OrderTimeoutJob = OrderTimeoutJob = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        orders_repository_1.OrdersRepository,
        app_logger_1.AppLogger])
], OrderTimeoutJob);
//# sourceMappingURL=order-timeout.job.js.map