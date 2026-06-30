const MYANMAR_TIME_ZONE = 'Asia/Yangon';

export function formatMyanmarTime(at: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: MYANMAR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
    .format(at)
    .replace(',', '');
}
