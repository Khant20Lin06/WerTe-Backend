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
exports.CustomerStoresController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const customer_store_catalog_entry_dto_1 = require("../dto/customer-store-catalog-entry.dto");
const customer_store_detail_dto_1 = require("../dto/customer-store-detail.dto");
const customer_store_facets_dto_1 = require("../dto/customer-store-facets.dto");
const get_customer_store_catalog_query_dto_1 = require("../dto/get-customer-store-catalog-query.dto");
const customer_store_summary_dto_1 = require("../dto/customer-store-summary.dto");
const list_customer_stores_query_dto_1 = require("../dto/list-customer-stores-query.dto");
const customer_store_discovery_service_1 = require("../services/customer-store-discovery.service");
let CustomerStoresController = class CustomerStoresController {
    constructor(customerStoreDiscoveryService) {
        this.customerStoreDiscoveryService = customerStoreDiscoveryService;
    }
    facets(currentUser, query) {
        return this.customerStoreDiscoveryService.getDiscoverableStoreFacets(currentUser, query);
    }
    list(currentUser, query) {
        return this.customerStoreDiscoveryService.listDiscoverableStores(currentUser, query);
    }
    detail(currentUser, branchId) {
        return this.customerStoreDiscoveryService.getDiscoverableStoreDetail(currentUser, branchId);
    }
    catalog(currentUser, branchId, query) {
        return this.customerStoreDiscoveryService.getDiscoverableStoreCatalogEntry(currentUser, branchId, query);
    }
};
exports.CustomerStoresController = CustomerStoresController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerStoreFacets',
        summary: 'Return customer-visible store discovery facets for the active filters',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns store type and township facet counts derived from customer-visible stores matching the current filters.',
        type: customer_store_facets_dto_1.CustomerStoreFacetsDto,
    }),
    (0, common_1.Get)('facets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_customer_stores_query_dto_1.ListCustomerStoresQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerStoresController.prototype, "facets", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        operationId: 'listCustomerStores',
        summary: 'List customer-visible stores with multi-type discovery filters',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns active merchant branches with approved active store types visible to the authenticated customer.',
        type: customer_store_summary_dto_1.CustomerStoreSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_customer_stores_query_dto_1.ListCustomerStoresQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerStoresController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerStoreDetail',
        summary: 'Return customer-visible store detail metadata, catalog-entry options, and visible catalog counts',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Customer-visible store branch identifier.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns customer-visible store detail metadata for an active branch with at least one approved active store type.',
        type: customer_store_detail_dto_1.CustomerStoreDetailDto,
    }),
    (0, common_1.Get)(':branchId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], CustomerStoresController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerStoreCatalogEntry',
        summary: 'Return the customer-visible catalog entry for a branch scoped to a selected approved store type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Customer-visible store branch identifier.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns store detail metadata plus the visible catalog for the selected approved store-type entry.',
        type: customer_store_catalog_entry_dto_1.CustomerStoreCatalogEntryDto,
    }),
    (0, common_1.Get)(':branchId/catalog'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, get_customer_store_catalog_query_dto_1.GetCustomerStoreCatalogQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerStoresController.prototype, "catalog", null);
exports.CustomerStoresController = CustomerStoresController = __decorate([
    (0, swagger_1.ApiTags)('customer-stores'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/stores'),
    __metadata("design:paramtypes", [customer_store_discovery_service_1.CustomerStoreDiscoveryService])
], CustomerStoresController);
//# sourceMappingURL=customer-stores.controller.js.map