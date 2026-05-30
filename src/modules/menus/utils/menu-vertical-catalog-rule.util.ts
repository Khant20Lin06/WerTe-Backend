import { HttpStatus } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';

export type MenuVerticalStoreTypeSummary = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

export type MenuVerticalCatalogRuleProfile = {
  storeTypeId: string;
  storeTypeCode: string;
  storeTypeName: string;
  sortOrder: number;
  requiredFields: string[];
  requiresStockTracking: boolean;
  requiredAttributeKeysAnyOf: string[];
  notes: string[];
};

type MenuVerticalCatalogRuleDefinition = {
  requiredFields: string[];
  requiresStockTracking: boolean;
  requiredAttributeKeysAnyOf: string[];
  notes: string[];
};

type MenuVerticalCatalogRuleInput = {
  sku?: string | null;
  brand?: string | null;
  attributes?: Record<string, unknown> | null;
  isStockTracked: boolean;
};

type MenuVerticalCatalogRuleViolation = {
  storeTypeId: string;
  storeTypeCode: string;
  storeTypeName: string;
  missingFields: string[];
  stockTrackingRequired: boolean;
  missingAttributeKeysAnyOf: string[];
};

const menuVerticalCatalogRuleDefinitions: Record<
  string,
  MenuVerticalCatalogRuleDefinition
> = {
  restaurant: {
    requiredFields: [],
    requiresStockTracking: false,
    requiredAttributeKeysAnyOf: [],
    notes: [
      'Restaurant items keep the base menu flow and do not require retail-style identifiers.',
    ],
  },
  grocery: {
    requiredFields: ['sku'],
    requiresStockTracking: true,
    requiredAttributeKeysAnyOf: [
      'unitOfMeasure',
      'weight',
      'weightGrams',
      'volumeMl',
      'packSize',
      'unitCount',
    ],
    notes: [
      'Grocery items should expose a measurable unit such as weight, volume, or pack size.',
    ],
  },
  pharmacy: {
    requiredFields: ['sku', 'brand'],
    requiresStockTracking: true,
    requiredAttributeKeysAnyOf: ['dosageStrength', 'dosageForm', 'packSize'],
    notes: [
      'Pharmacy items should identify dosage or pack metadata before they are published.',
    ],
  },
  beauty: {
    requiredFields: ['sku', 'brand'],
    requiresStockTracking: false,
    requiredAttributeKeysAnyOf: ['size', 'volumeMl', 'shade', 'skinType', 'scent'],
    notes: [
      'Beauty items should describe the shopper-facing variant or formulation.',
    ],
  },
  fashion: {
    requiredFields: ['sku'],
    requiresStockTracking: false,
    requiredAttributeKeysAnyOf: ['size', 'color', 'material'],
    notes: [
      'Fashion items should declare at least one sizing or material attribute.',
    ],
  },
};

export function buildMenuVerticalCatalogRuleProfiles(
  storeTypes: MenuVerticalStoreTypeSummary[],
): MenuVerticalCatalogRuleProfile[] {
  return deduplicateStoreTypes(storeTypes).map((storeType) => {
    const rule = resolveMenuVerticalCatalogRuleDefinition(storeType.code);

    return {
      storeTypeId: storeType.id,
      storeTypeCode: storeType.code,
      storeTypeName: storeType.name,
      sortOrder: storeType.sortOrder,
      requiredFields: [...rule.requiredFields],
      requiresStockTracking: rule.requiresStockTracking,
      requiredAttributeKeysAnyOf: [...rule.requiredAttributeKeysAnyOf],
      notes: [...rule.notes],
    };
  });
}

export function assertMenuVerticalCatalogRules(
  storeTypes: MenuVerticalStoreTypeSummary[],
  item: MenuVerticalCatalogRuleInput,
): void {
  const violations = buildMenuVerticalCatalogRuleProfiles(storeTypes)
    .map((profile) => toRuleViolation(profile, item))
    .filter((violation): violation is MenuVerticalCatalogRuleViolation => violation !== null);

  if (violations.length === 0) {
    return;
  }

  throw new AppException(
    'Menu item payload does not satisfy the catalog requirements for one or more effective store types.',
    HttpStatus.BAD_REQUEST,
    {
      code: ErrorCodes.validationFailed,
      details: {
        effectiveStoreTypeCodes: violations.map((violation) => violation.storeTypeCode),
        verticalRuleViolations: violations,
      },
    },
  );
}

function toRuleViolation(
  profile: MenuVerticalCatalogRuleProfile,
  item: MenuVerticalCatalogRuleInput,
): MenuVerticalCatalogRuleViolation | null {
  const missingFields = profile.requiredFields.filter((field) =>
    isMissingRequiredField(field, item),
  );
  const attributeKeySet = new Set(
    Object.keys(item.attributes ?? {}).map((key) => key.toLowerCase()),
  );
  const missingAttributeKeysAnyOf =
    profile.requiredAttributeKeysAnyOf.length > 0 &&
    !profile.requiredAttributeKeysAnyOf.some((key) =>
      attributeKeySet.has(key.toLowerCase()),
    )
      ? [...profile.requiredAttributeKeysAnyOf]
      : [];
  const stockTrackingRequired =
    profile.requiresStockTracking && item.isStockTracked !== true;

  if (
    missingFields.length === 0 &&
    missingAttributeKeysAnyOf.length === 0 &&
    !stockTrackingRequired
  ) {
    return null;
  }

  return {
    storeTypeId: profile.storeTypeId,
    storeTypeCode: profile.storeTypeCode,
    storeTypeName: profile.storeTypeName,
    missingFields,
    stockTrackingRequired,
    missingAttributeKeysAnyOf,
  };
}

function isMissingRequiredField(
  field: string,
  item: MenuVerticalCatalogRuleInput,
): boolean {
  switch (field) {
    case 'sku':
      return !hasText(item.sku);
    case 'brand':
      return !hasText(item.brand);
    default:
      return false;
  }
}

function hasText(value: string | null | undefined): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

function resolveMenuVerticalCatalogRuleDefinition(
  storeTypeCode: string,
): MenuVerticalCatalogRuleDefinition {
  return (
    menuVerticalCatalogRuleDefinitions[storeTypeCode.toLowerCase()] ?? {
      requiredFields: [],
      requiresStockTracking: false,
      requiredAttributeKeysAnyOf: [],
      notes: ['No additional vertical-specific catalog rules are enforced yet.'],
    }
  );
}

function deduplicateStoreTypes(
  storeTypes: MenuVerticalStoreTypeSummary[],
): MenuVerticalStoreTypeSummary[] {
  const seenCodes = new Set<string>();

  return [...storeTypes]
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
    )
    .filter((storeType) => {
      const key = storeType.code.toLowerCase();

      if (seenCodes.has(key)) {
        return false;
      }

      seenCodes.add(key);
      return true;
    });
}
