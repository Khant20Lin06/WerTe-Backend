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
exports.DispatchQueryService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const dispatch_queue_entry_entity_1 = require("../entities/dispatch-queue-entry.entity");
const dispatch_repository_1 = require("../repositories/dispatch.repository");
let DispatchQueryService = class DispatchQueryService {
    constructor(dispatchRepository) {
        this.dispatchRepository = dispatchRepository;
    }
    buildDispatchQueueEntry(entry) {
        return (0, dispatch_queue_entry_entity_1.buildDispatchQueueEntry)(entry);
    }
    async listQueueEntries() {
        const entries = await this.dispatchRepository.findQueueEntries();
        return entries.map((entry) => this.buildDispatchQueueEntry(entry));
    }
    async getQueueEntry(orderId) {
        const entry = await this.dispatchRepository.findQueueEntryByOrderId(orderId);
        if (entry === null) {
            throw new app_exception_1.AppException('Dispatch queue entry was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return this.buildDispatchQueueEntry(entry);
    }
};
exports.DispatchQueryService = DispatchQueryService;
exports.DispatchQueryService = DispatchQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dispatch_repository_1.DispatchRepository])
], DispatchQueryService);
//# sourceMappingURL=dispatch-query.service.js.map