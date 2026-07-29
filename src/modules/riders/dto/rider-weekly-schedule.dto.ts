import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export const WEEKDAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class DayScheduleDto {
  @ApiProperty({
    description: 'Whether the rider plans to work on this day.',
    example: true,
  })
  @IsBoolean()
  available!: boolean;

  @ApiPropertyOptional({
    description: 'Planned start time (24h HH:mm).',
    example: '09:00',
    nullable: true,
  })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm format' })
  startTime?: string | null;

  @ApiPropertyOptional({
    description: 'Planned end time (24h HH:mm).',
    example: '18:00',
    nullable: true,
  })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm format' })
  endTime?: string | null;
}

export class UpdateRiderWeeklyScheduleDto {
  @ApiProperty({ description: 'Monday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  mon!: DayScheduleDto;

  @ApiProperty({ description: 'Tuesday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tue!: DayScheduleDto;

  @ApiProperty({ description: 'Wednesday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wed!: DayScheduleDto;

  @ApiProperty({ description: 'Thursday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thu!: DayScheduleDto;

  @ApiProperty({ description: 'Friday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  fri!: DayScheduleDto;

  @ApiProperty({ description: 'Saturday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sat!: DayScheduleDto;

  @ApiProperty({ description: 'Sunday schedule.', type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sun!: DayScheduleDto;
}

export class RiderWeeklyScheduleDto extends UpdateRiderWeeklyScheduleDto {}

function defaultDaySchedule(available: boolean): DayScheduleDto {
  return { available, startTime: available ? '09:00' : null, endTime: available ? '18:00' : null };
}

export function defaultWeeklySchedule(): RiderWeeklyScheduleDto {
  return {
    mon: defaultDaySchedule(true),
    tue: defaultDaySchedule(true),
    wed: defaultDaySchedule(true),
    thu: defaultDaySchedule(true),
    fri: defaultDaySchedule(true),
    sat: defaultDaySchedule(true),
    sun: defaultDaySchedule(false),
  };
}

export function toRiderWeeklyScheduleDto(
  raw: Prisma.JsonValue | null,
): RiderWeeklyScheduleDto {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultWeeklySchedule();
  }
  const value = raw as Record<string, unknown>;
  const result = defaultWeeklySchedule();
  for (const day of WEEKDAYS) {
    const entry = value[day];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const e = entry as Record<string, unknown>;
      result[day] = {
        available: typeof e.available === 'boolean' ? e.available : false,
        startTime: typeof e.startTime === 'string' ? e.startTime : null,
        endTime: typeof e.endTime === 'string' ? e.endTime : null,
      };
    }
  }
  return result;
}
