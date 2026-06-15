import { Injectable } from '@nestjs/common';
import { SystemMessageCode } from '@prisma/client';

import { SystemMessageTemplateRepository } from '../repositories/system-message-template.repository';

const defaultTemplateBodies: Record<SystemMessageCode, string> = {
  ORDER_PLACED:
    'Order {{orderCode}} was placed and is waiting for merchant confirmation.',
  ORDER_ACCEPTED:
    '{{merchantName}} accepted the order and will start preparing it soon.',
  ORDER_REJECTED:
    '{{merchantName}} rejected the order. {{note}}',
  ORDER_PREPARING:
    '{{merchantName}} is preparing the order now.',
  ORDER_READY:
    'Order {{orderCode}} is ready for rider pickup.',
  RIDER_ASSIGNED:
    '{{riderName}} was assigned to deliver the order.',
  RIDER_ACCEPTED:
    '{{riderName}} accepted the delivery request.',
  RIDER_REJECTED_ASSIGNMENT:
    '{{riderName}} rejected the delivery request. The order will be reassigned.',
  ORDER_PICKED_UP:
    '{{riderName}} picked up the order from {{branchName}}.',
  ORDER_ON_THE_WAY:
    '{{riderName}} is on the way with the order.',
  ORDER_DELIVERED:
    '{{riderName}} delivered the order successfully.',
  ORDER_CANCELLED:
    'Order {{orderCode}} was cancelled. {{note}}',
  FAILED_DELIVERY:
    'Delivery for order {{orderCode}} failed. {{reasonCode}} {{note}}',
  MERCHANT_HANDOFF_CONFIRMED:
    '{{merchantName}} handed the order over to {{riderName}}.',
  DELIVERY_PROOF_SUBMITTED:
    '{{riderName}} submitted delivery proof for the order.',
  ADMIN_INTERVENTION:
    'Operations updated the order flow. {{reasonCode}} {{note}}',
  PAYMENT_PENDING:
    'Payment for order {{orderCode}} is pending. {{note}}',
  PAYMENT_SUCCEEDED:
    'Payment for order {{orderCode}} was completed successfully.',
  PAYMENT_FAILED:
    'Payment for order {{orderCode}} failed. {{reasonCode}} {{note}}',
  PAYMENT_CANCELLED:
    'Payment for order {{orderCode}} was cancelled. {{note}}',
  REFUND_REQUESTED:
    'A refund was requested for order {{orderCode}}. {{reasonCode}} {{note}}',
  REFUND_SUCCEEDED:
    'Refund for order {{orderCode}} was completed successfully.',
  REFUND_FAILED:
    'Refund for order {{orderCode}} failed. {{reasonCode}} {{note}}',
};

@Injectable()
export class SystemMessageTemplateService {
  constructor(
    private readonly templateRepository: SystemMessageTemplateRepository,
  ) {}

  saveTemplateOverride(payload: {
    code: SystemMessageCode;
    label: string;
    bodyTemplate: string;
    isActive?: boolean;
  }) {
    return this.templateRepository.upsertTemplate(payload);
  }

  async render(
    code: SystemMessageCode,
    variables: Record<string, string | null | undefined>,
  ): Promise<string> {
    const template = await this.templateRepository.findActiveByCode(code);
    const bodyTemplate =
      template?.bodyTemplate ?? defaultTemplateBodies[code] ?? '';

    return this.interpolate(bodyTemplate, variables).replace(/\s+/g, ' ').trim();
  }

  private interpolate(
    template: string,
    variables: Record<string, string | null | undefined>,
  ): string {
    return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => {
      const value = variables[key];

      return value == null ? '' : value;
    });
  }
}
