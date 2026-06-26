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
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const app_logger_1 = require("../logging/app.logger");
let S3Service = class S3Service {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.client = null;
        this.bucket = '';
        const s3 = this.configService.get('s3');
        this.isConfigured = !!(s3.accessKeyId && s3.secretAccessKey);
    }
    onModuleInit() {
        const s3 = this.configService.get('s3');
        this.bucket = s3.bucket;
        this.publicBaseUrl = s3.publicBaseUrl;
        if (!this.isConfigured) {
            this.logger.logEvent('S3 not configured — running in stub mode.', {}, 'S3Service');
            return;
        }
        this.client = new client_s3_1.S3Client({
            region: s3.region,
            ...(s3.endpoint ? { endpoint: s3.endpoint, forcePathStyle: true } : {}),
            credentials: {
                accessKeyId: s3.accessKeyId,
                secretAccessKey: s3.secretAccessKey,
            },
        });
        this.logger.logEvent('S3 client initialized.', { bucket: this.bucket, region: s3.region }, 'S3Service');
    }
    async upload(key, data, options) {
        if (!this.isConfigured || !this.client) {
            return this.uploadStub(key);
        }
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: data,
                ContentType: options?.contentType ?? 'application/octet-stream',
                ...(options?.acl ? { ACL: options.acl } : {}),
            },
        });
        await upload.done();
        const url = this.buildUrl(key);
        this.logger.logEvent('S3 upload complete.', { key, bucket: this.bucket }, 'S3Service');
        return { key, url };
    }
    async delete(key) {
        if (!this.isConfigured || !this.client) {
            this.logger.logEvent('S3 stub delete.', { key }, 'S3Service');
            return;
        }
        await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        this.logger.logEvent('S3 object deleted.', { key, bucket: this.bucket }, 'S3Service');
    }
    async exists(key) {
        if (!this.isConfigured || !this.client) {
            return false;
        }
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        }
        catch {
            return false;
        }
    }
    buildUrl(key) {
        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
        }
        return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }
    uploadStub(key) {
        const url = `https://stub-bucket.s3.amazonaws.com/${key}`;
        this.logger.logEvent('S3 stub upload.', { key }, 'S3Service');
        return { key, url };
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_logger_1.AppLogger])
], S3Service);
//# sourceMappingURL=s3.service.js.map