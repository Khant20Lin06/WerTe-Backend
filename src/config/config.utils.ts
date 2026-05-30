export type NodeEnvironment =
  | 'development'
  | 'test'
  | 'staging'
  | 'production';

export function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value == null || value.trim() == '') {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

export function parseCsv(value: string | undefined): string[] {
  if (value == null || value.trim() == '') {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
