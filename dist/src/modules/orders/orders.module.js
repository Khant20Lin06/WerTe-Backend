"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const checkout_module_1 = require("../checkout/checkout.module");
const messaging_module_1 = require("../messaging/messaging.module");
const menus_module_1 = require("../menus/menus.module");
const notifications_module_1 = require("../notifications/notifications.module");
const admin_orders_controller_1 = require("./controllers/admin-orders.controller");
const customer_orders_controller_1 = require("./controllers/customer-orders.controller");
const merchant_orders_controller_1 = require("./controllers/merchant-orders.controller");
const rider_orders_controller_1 = require("./controllers/rider-orders.controller");
const admin_order_operations_service_1 = require("./services/admin-order-operations.service");
const order_cancellation_service_1 = require("./services/order-cancellation.service");
const order_creation_service_1 = require("./services/order-creation.service");
const merchant_order_handling_service_1 = require("./services/merchant-order-handling.service");
const order_query_service_1 = require("./services/order-query.service");
const orders_repository_1 = require("./repositories/orders.repository");
const order_policy_service_1 = require("./policies/order-policy.service");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => checkout_module_1.CheckoutModule),
            messaging_module_1.MessagingModule,
            menus_module_1.MenusModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            customer_orders_controller_1.CustomerOrdersController,
            merchant_orders_controller_1.MerchantOrdersController,
            rider_orders_controller_1.RiderOrdersController,
            admin_orders_controller_1.AdminOrdersController,
        ],
        providers: [
            orders_repository_1.OrdersRepository,
            order_creation_service_1.OrderCreationService,
            admin_order_operations_service_1.AdminOrderOperationsService,
            order_query_service_1.OrderQueryService,
            order_cancellation_service_1.OrderCancellationService,
            merchant_order_handling_service_1.MerchantOrderHandlingService,
            order_policy_service_1.OrderPolicyService,
        ],
        exports: [
            order_query_service_1.OrderQueryService,
            orders_repository_1.OrdersRepository,
            order_creation_service_1.OrderCreationService,
            order_policy_service_1.OrderPolicyService,
        ],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map