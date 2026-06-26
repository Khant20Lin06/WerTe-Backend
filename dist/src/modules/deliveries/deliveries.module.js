"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesModule = void 0;
const common_1 = require("@nestjs/common");
const messaging_module_1 = require("../messaging/messaging.module");
const orders_module_1 = require("../orders/orders.module");
const rider_deliveries_controller_1 = require("./controllers/rider-deliveries.controller");
const deliveries_repository_1 = require("./repositories/deliveries.repository");
const rider_delivery_actions_service_1 = require("./services/rider-delivery-actions.service");
const delivery_query_service_1 = require("./services/delivery-query.service");
let DeliveriesModule = class DeliveriesModule {
};
exports.DeliveriesModule = DeliveriesModule;
exports.DeliveriesModule = DeliveriesModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, messaging_module_1.MessagingModule],
        controllers: [rider_deliveries_controller_1.RiderDeliveriesController],
        providers: [
            deliveries_repository_1.DeliveriesRepository,
            delivery_query_service_1.DeliveryQueryService,
            rider_delivery_actions_service_1.RiderDeliveryActionsService,
        ],
        exports: [
            deliveries_repository_1.DeliveriesRepository,
            delivery_query_service_1.DeliveryQueryService,
            rider_delivery_actions_service_1.RiderDeliveryActionsService,
        ],
    })
], DeliveriesModule);
//# sourceMappingURL=deliveries.module.js.map