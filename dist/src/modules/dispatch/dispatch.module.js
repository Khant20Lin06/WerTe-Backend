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
exports.DispatchModule = void 0;
const common_1 = require("@nestjs/common");
const deliveries_module_1 = require("../deliveries/deliveries.module");
const messaging_module_1 = require("../messaging/messaging.module");
const orders_module_1 = require("../orders/orders.module");
const riders_module_1 = require("../riders/riders.module");
const admin_dispatch_controller_1 = require("./controllers/admin-dispatch.controller");
const dispatch_repository_1 = require("./repositories/dispatch.repository");
const dispatch_assignment_service_1 = require("./services/dispatch-assignment.service");
const auto_dispatch_service_1 = require("./services/auto-dispatch.service");
const dispatch_query_service_1 = require("./services/dispatch-query.service");
let DispatchModule = class DispatchModule {
    constructor(autoDispatchService) {
        this.autoDispatchService = autoDispatchService;
    }
    onModuleInit() {
        this.autoDispatchService.registerHandlers();
    }
};
exports.DispatchModule = DispatchModule;
exports.DispatchModule = DispatchModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, deliveries_module_1.DeliveriesModule, riders_module_1.RidersModule, messaging_module_1.MessagingModule],
        controllers: [admin_dispatch_controller_1.AdminDispatchController],
        providers: [
            dispatch_repository_1.DispatchRepository,
            dispatch_query_service_1.DispatchQueryService,
            dispatch_assignment_service_1.DispatchAssignmentService,
            auto_dispatch_service_1.AutoDispatchService,
        ],
        exports: [dispatch_repository_1.DispatchRepository, dispatch_query_service_1.DispatchQueryService, dispatch_assignment_service_1.DispatchAssignmentService, auto_dispatch_service_1.AutoDispatchService],
    }),
    __metadata("design:paramtypes", [auto_dispatch_service_1.AutoDispatchService])
], DispatchModule);
//# sourceMappingURL=dispatch.module.js.map