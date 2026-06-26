"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_context_middleware_1 = require("../../../src/common/middleware/request-context.middleware");
const request_context_service_1 = require("../../../src/infrastructure/logging/request-context.service");
describe('RequestContextMiddleware', () => {
    it('propagates request id from the incoming header', () => {
        const contextService = new request_context_service_1.RequestContextService();
        const middleware = new request_context_middleware_1.RequestContextMiddleware(contextService);
        const request = {
            header: jest.fn().mockReturnValue('req_789'),
        };
        const response = {
            setHeader: jest.fn(),
        };
        const next = jest.fn(() => {
            expect(contextService.getRequestId()).toBe('req_789');
        });
        middleware.use(request, response, next);
        expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req_789');
        expect(next).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=request-context.middleware.spec.js.map