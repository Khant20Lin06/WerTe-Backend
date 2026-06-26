"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationLimitPipe = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../dto/pagination-query.dto");
let PaginationLimitPipe = class PaginationLimitPipe {
    transform(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = Number(value);
        if (!Number.isInteger(parsed)) {
            throw new common_1.BadRequestException(`limit must be an integer (received "${value}").`);
        }
        if (parsed < 1) {
            throw new common_1.BadRequestException(`limit must be at least 1 (received ${parsed}).`);
        }
        if (parsed > pagination_query_dto_1.PAGINATION_MAX_LIMIT) {
            throw new common_1.BadRequestException(`limit must not exceed ${pagination_query_dto_1.PAGINATION_MAX_LIMIT} (received ${parsed}).`);
        }
        return parsed;
    }
};
exports.PaginationLimitPipe = PaginationLimitPipe;
exports.PaginationLimitPipe = PaginationLimitPipe = __decorate([
    (0, common_1.Injectable)()
], PaginationLimitPipe);
//# sourceMappingURL=pagination-limit.pipe.js.map