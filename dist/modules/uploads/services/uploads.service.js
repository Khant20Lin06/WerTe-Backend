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
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path = require("path");
const crypto = require("crypto");
const common_2 = require("@nestjs/common");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const s3_service_1 = require("../../../infrastructure/storage/s3.service");
let UploadsService = class UploadsService {
    constructor(s3Service, configService) {
        this.s3Service = s3Service;
        this.configService = configService;
        const s3 = this.configService.get('s3');
        this.maxFileSizeBytes = s3.upload.maxFileSizeBytes;
        this.allowedMimeTypes = s3.upload.allowedMimeTypes;
    }
    async uploadFile(file, context, ownerEntityId) {
        this.validateFile(file);
        const ext = path.extname(file.originalname).toLowerCase() || this.extFromMime(file.mimetype);
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const key = `${context}/${ownerEntityId}/${uniqueId}${ext}`;
        const result = await this.s3Service.upload(key, file.buffer, {
            contentType: file.mimetype,
            acl: 'public-read',
        });
        return { key: result.key, url: result.url };
    }
    validateFile(file) {
        if (file.size > this.maxFileSizeBytes) {
            throw new app_exception_1.AppException(`File size ${file.size} exceeds the maximum allowed size of ${this.maxFileSizeBytes} bytes.`, common_2.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new app_exception_1.AppException(`File type "${file.mimetype}" is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}.`, common_2.HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    extFromMime(mime) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
        };
        return map[mime] ?? '';
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_service_1.S3Service,
        config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map