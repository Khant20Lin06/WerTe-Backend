"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const system_message_template_service_1 = require("../../../../src/modules/messaging/services/system-message-template.service");
describe('SystemMessageTemplateService', () => {
    it('renders the default template body when no override exists', async () => {
        const repository = {
            findActiveByCode: jest.fn().mockResolvedValue(null),
        };
        const service = new system_message_template_service_1.SystemMessageTemplateService(repository);
        const result = await service.render(client_1.SystemMessageCode.ORDER_ACCEPTED, {
            merchantName: 'Demo Merchant',
        });
        expect(result).toBe('Demo Merchant accepted the order and will start preparing it soon.');
    });
    it('renders custom template overrides and trims empty placeholders', async () => {
        const repository = {
            findActiveByCode: jest.fn().mockResolvedValue({
                id: 'tmpl_1',
                code: client_1.SystemMessageCode.ORDER_CANCELLED,
                label: 'Order Cancelled',
                bodyTemplate: 'Order {{orderCode}} was cancelled. {{note}}',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        };
        const service = new system_message_template_service_1.SystemMessageTemplateService(repository);
        const result = await service.render(client_1.SystemMessageCode.ORDER_CANCELLED, {
            orderCode: 'ORD-00000001',
            note: '',
        });
        expect(result).toBe('Order ORD-00000001 was cancelled.');
    });
    it('normalizes extra whitespace after interpolation for snapshot-stable auto messages', async () => {
        const repository = {
            findActiveByCode: jest.fn().mockResolvedValue({
                id: 'tmpl_2',
                code: client_1.SystemMessageCode.ADMIN_INTERVENTION,
                label: 'Admin Intervention',
                bodyTemplate: 'Operations updated the order flow.   {{reasonCode}}   {{note}}',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        };
        const service = new system_message_template_service_1.SystemMessageTemplateService(repository);
        const result = await service.render(client_1.SystemMessageCode.ADMIN_INTERVENTION, {
            reasonCode: 'manual_override',
            note: '',
        });
        expect(result).toBe('Operations updated the order flow. manual_override');
    });
    it('renders default payment templates for the new finance system events', async () => {
        const repository = {
            findActiveByCode: jest.fn().mockResolvedValue(null),
        };
        const service = new system_message_template_service_1.SystemMessageTemplateService(repository);
        const result = await service.render(client_1.SystemMessageCode.PAYMENT_FAILED, {
            orderCode: 'ORD-00000042',
            reasonCode: 'provider_timeout',
            note: '',
        });
        expect(result).toBe('Payment for order ORD-00000042 failed. provider_timeout');
    });
    it('delegates template override saves to the repository', async () => {
        const repository = {
            upsertTemplate: jest.fn().mockResolvedValue(undefined),
        };
        const service = new system_message_template_service_1.SystemMessageTemplateService(repository);
        await service.saveTemplateOverride({
            code: client_1.SystemMessageCode.ORDER_PICKED_UP,
            label: 'Picked Up',
            bodyTemplate: '{{riderName}} picked up the order.',
        });
        expect(repository.upsertTemplate).toHaveBeenCalledWith({
            code: client_1.SystemMessageCode.ORDER_PICKED_UP,
            label: 'Picked Up',
            bodyTemplate: '{{riderName}} picked up the order.',
        });
    });
});
//# sourceMappingURL=system-message-template.service.spec.js.map