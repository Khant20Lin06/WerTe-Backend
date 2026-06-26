"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../../src/common/exceptions/app.exception");
const global_exception_filter_1 = require("../../../src/common/exceptions/global-exception.filter");
describe('GlobalExceptionFilter', () => {
    it('serializes AppException into the standard error envelope', () => {
        const filter = new global_exception_filter_1.GlobalExceptionFilter();
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const request = {
            headers: {
                'x-request-id': 'req_456',
            },
            method: 'GET',
            url: '/api/v1/test',
        };
        const host = {
            switchToHttp: () => ({
                getResponse: () => response,
                getRequest: () => request,
            }),
        };
        filter.catch(new app_exception_1.AppException('Missing resource.', common_1.HttpStatus.NOT_FOUND), host);
        expect(response.status).toHaveBeenCalledWith(common_1.HttpStatus.NOT_FOUND);
        expect(response.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Missing resource.',
                details: undefined,
            },
            meta: {
                requestId: 'req_456',
                timestamp: expect.any(String),
            },
        });
    });
});
//# sourceMappingURL=global-exception.filter.spec.js.map