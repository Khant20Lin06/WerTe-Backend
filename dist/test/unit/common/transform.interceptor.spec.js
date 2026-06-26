"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const transform_interceptor_1 = require("../../../src/common/interceptors/transform.interceptor");
describe('TransformInterceptor', () => {
    it('wraps successful responses in the standard envelope', async () => {
        const interceptor = new transform_interceptor_1.TransformInterceptor();
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        'x-request-id': 'req_123',
                    },
                }),
            }),
        };
        const result = await (0, rxjs_1.lastValueFrom)(interceptor.intercept(context, {
            handle: () => (0, rxjs_1.of)({ status: 'ok' }),
        }));
        expect(result).toEqual({
            success: true,
            data: {
                status: 'ok',
            },
            meta: {
                requestId: 'req_123',
                timestamp: expect.any(String),
            },
        });
    });
    it('does not double-wrap a prebuilt response envelope', async () => {
        const interceptor = new transform_interceptor_1.TransformInterceptor();
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {},
                }),
            }),
        };
        const result = await (0, rxjs_1.lastValueFrom)(interceptor.intercept(context, {
            handle: () => (0, rxjs_1.of)({
                success: true,
                data: { ok: true },
                meta: {
                    requestId: 'req_existing',
                    timestamp: '2026-04-18T10:00:00.000Z',
                },
            }),
        }));
        expect(result).toEqual({
            success: true,
            data: { ok: true },
            meta: {
                requestId: 'req_existing',
                timestamp: '2026-04-18T10:00:00.000Z',
            },
        });
    });
});
//# sourceMappingURL=transform.interceptor.spec.js.map