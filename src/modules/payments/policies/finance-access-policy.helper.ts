import { HttpStatus } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

export function hasCustomerFinanceScope(
  currentUser: AuthenticatedUserEntity,
): boolean {
  return (
    currentUser.role === UserRole.CUSTOMER &&
    currentUser.actorContext.customerProfileId !== undefined
  );
}

export function requireCustomerFinanceScope(
  currentUser: AuthenticatedUserEntity,
): string {
  const customerProfileId = currentUser.actorContext.customerProfileId;

  if (currentUser.role !== UserRole.CUSTOMER || customerProfileId === undefined) {
    throw new AppException(
      'The authenticated actor does not have a customer profile scope.',
      HttpStatus.FORBIDDEN,
      {
        code: ErrorCodes.forbidden,
      },
    );
  }

  return customerProfileId;
}

export function hasAdminFinanceAccess(
  currentUser: AuthenticatedUserEntity,
): boolean {
  return currentUser.role === UserRole.ADMIN;
}

export function requireAdminFinanceAccess(
  currentUser: AuthenticatedUserEntity,
  resourceLabel: 'payments' | 'refunds',
): void {
  if (!hasAdminFinanceAccess(currentUser)) {
    throw new AppException(
      `Only admins can manage ${resourceLabel}.`,
      HttpStatus.FORBIDDEN,
      {
        code: ErrorCodes.forbidden,
      },
    );
  }
}
