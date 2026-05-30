import { SystemMessageCode } from '@prisma/client';

import { SystemMessageTemplateService } from '../../../../src/modules/messaging/services/system-message-template.service';
import { SystemMessageTemplateRepository } from '../../../../src/modules/messaging/repositories/system-message-template.repository';

describe('SystemMessageTemplateService', () => {
  it('renders the default template body when no override exists', async () => {
    const repository = {
      findActiveByCode: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<SystemMessageTemplateRepository>;
    const service = new SystemMessageTemplateService(repository);

    const result = await service.render(SystemMessageCode.ORDER_ACCEPTED, {
      merchantName: 'Demo Merchant',
    });

    expect(result).toBe(
      'Demo Merchant accepted the order and will start preparing it soon.',
    );
  });

  it('renders custom template overrides and trims empty placeholders', async () => {
    const repository = {
      findActiveByCode: jest.fn().mockResolvedValue({
        id: 'tmpl_1',
        code: SystemMessageCode.ORDER_CANCELLED,
        label: 'Order Cancelled',
        bodyTemplate: 'Order {{orderCode}} was cancelled. {{note}}',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as jest.Mocked<SystemMessageTemplateRepository>;
    const service = new SystemMessageTemplateService(repository);

    const result = await service.render(SystemMessageCode.ORDER_CANCELLED, {
      orderCode: 'ORD-00000001',
      note: '',
    });

    expect(result).toBe('Order ORD-00000001 was cancelled.');
  });

  it('normalizes extra whitespace after interpolation for snapshot-stable auto messages', async () => {
    const repository = {
      findActiveByCode: jest.fn().mockResolvedValue({
        id: 'tmpl_2',
        code: SystemMessageCode.ADMIN_INTERVENTION,
        label: 'Admin Intervention',
        bodyTemplate: 'Operations updated the order flow.   {{reasonCode}}   {{note}}',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as jest.Mocked<SystemMessageTemplateRepository>;
    const service = new SystemMessageTemplateService(repository);

    const result = await service.render(SystemMessageCode.ADMIN_INTERVENTION, {
      reasonCode: 'manual_override',
      note: '',
    });

    expect(result).toBe('Operations updated the order flow. manual_override');
  });

  it('renders default payment templates for the new finance system events', async () => {
    const repository = {
      findActiveByCode: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<SystemMessageTemplateRepository>;
    const service = new SystemMessageTemplateService(repository);

    const result = await service.render(SystemMessageCode.PAYMENT_FAILED, {
      orderCode: 'ORD-00000042',
      reasonCode: 'provider_timeout',
      note: '',
    });

    expect(result).toBe(
      'Payment for order ORD-00000042 failed. provider_timeout',
    );
  });

  it('delegates template override saves to the repository', async () => {
    const repository = {
      upsertTemplate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageTemplateRepository>;
    const service = new SystemMessageTemplateService(repository);

    await service.saveTemplateOverride({
      code: SystemMessageCode.ORDER_PICKED_UP,
      label: 'Picked Up',
      bodyTemplate: '{{riderName}} picked up the order.',
    });

    expect(repository.upsertTemplate).toHaveBeenCalledWith({
      code: SystemMessageCode.ORDER_PICKED_UP,
      label: 'Picked Up',
      bodyTemplate: '{{riderName}} picked up the order.',
    });
  });
});
