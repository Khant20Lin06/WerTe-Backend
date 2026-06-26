import { PipeTransform } from '@nestjs/common';
export declare class PaginationLimitPipe implements PipeTransform<string | undefined, number | undefined> {
    transform(value: string | undefined): number | undefined;
}
