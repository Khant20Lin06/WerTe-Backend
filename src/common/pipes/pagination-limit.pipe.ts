import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { PAGINATION_MAX_LIMIT } from '../dto/pagination-query.dto';

/**
 * Defence-in-depth backstop for any `limit` query parameter.
 *
 * The primary enforcement path is `@Max(100)` on DTO fields validated by
 * `ValidationPipe`. This pipe is registered globally so endpoints that accept
 * a raw `limit` query param (not wrapped in a DTO) are also protected against
 * unbounded database queries.
 *
 * Behaviour:
 *   - undefined / missing → pass through (callers use their own default)
 *   - non-numeric string → 400 Bad Request
 *   - numeric value > PAGINATION_MAX_LIMIT → 400 Bad Request
 *   - numeric value ≤ 0 → 400 Bad Request
 *   - valid numeric string → coerce to Number and pass through
 */
@Injectable()
export class PaginationLimitPipe implements PipeTransform<string | undefined, number | undefined> {
  transform(value: string | undefined): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      throw new BadRequestException(
        `limit must be an integer (received "${value}").`,
      );
    }

    if (parsed < 1) {
      throw new BadRequestException(
        `limit must be at least 1 (received ${parsed}).`,
      );
    }

    if (parsed > PAGINATION_MAX_LIMIT) {
      throw new BadRequestException(
        `limit must not exceed ${PAGINATION_MAX_LIMIT} (received ${parsed}).`,
      );
    }

    return parsed;
  }
}
