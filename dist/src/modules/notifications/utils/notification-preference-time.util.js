"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocalMinuteOfDay = parseLocalMinuteOfDay;
exports.resolveLocalMinuteOfDay = resolveLocalMinuteOfDay;
exports.resolveLocalSecondOfDay = resolveLocalSecondOfDay;
exports.isInventoryAlertPushMutedNow = isInventoryAlertPushMutedNow;
exports.resolveNextQuietHoursBoundaryAt = resolveNextQuietHoursBoundaryAt;
function parseLocalMinuteOfDay(value) {
    const [hour, minute] = value.split(':');
    return Number(hour) * 60 + Number(minute);
}
function resolveLocalMinuteOfDay(at, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
    });
    const parts = formatter.formatToParts(at);
    const hourPart = parts.find((part) => part.type === 'hour')?.value;
    const minutePart = parts.find((part) => part.type === 'minute')?.value;
    if (hourPart === undefined || minutePart === undefined) {
        return 0;
    }
    return Number(hourPart) * 60 + Number(minutePart);
}
function resolveLocalSecondOfDay(at, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone,
    });
    const parts = formatter.formatToParts(at);
    const hourPart = parts.find((part) => part.type === 'hour')?.value;
    const minutePart = parts.find((part) => part.type === 'minute')?.value;
    const secondPart = parts.find((part) => part.type === 'second')?.value;
    if (hourPart === undefined ||
        minutePart === undefined ||
        secondPart === undefined) {
        return 0;
    }
    return Number(hourPart) * 3600 + Number(minutePart) * 60 + Number(secondPart);
}
function isInventoryAlertPushMutedNow(preference, at = new Date()) {
    if (!preference.inventoryAlertQuietHoursEnabled ||
        preference.inventoryAlertQuietHoursStartLocalTime === null ||
        preference.inventoryAlertQuietHoursEndLocalTime === null ||
        preference.inventoryAlertQuietHoursTimezone === null) {
        return false;
    }
    const currentMinute = resolveLocalMinuteOfDay(at, preference.inventoryAlertQuietHoursTimezone);
    const startMinute = parseLocalMinuteOfDay(preference.inventoryAlertQuietHoursStartLocalTime);
    const endMinute = parseLocalMinuteOfDay(preference.inventoryAlertQuietHoursEndLocalTime);
    if (startMinute < endMinute) {
        return currentMinute >= startMinute && currentMinute < endMinute;
    }
    return currentMinute >= startMinute || currentMinute < endMinute;
}
function resolveNextQuietHoursBoundaryAt(preference, from = new Date()) {
    if (!preference.inventoryAlertPushEnabled ||
        !preference.inventoryAlertQuietHoursEnabled ||
        preference.inventoryAlertQuietHoursStartLocalTime === null ||
        preference.inventoryAlertQuietHoursEndLocalTime === null ||
        preference.inventoryAlertQuietHoursTimezone === null) {
        return null;
    }
    const currentSecondOfDay = resolveLocalSecondOfDay(from, preference.inventoryAlertQuietHoursTimezone);
    const boundarySeconds = [
        parseLocalMinuteOfDay(preference.inventoryAlertQuietHoursStartLocalTime) * 60,
        parseLocalMinuteOfDay(preference.inventoryAlertQuietHoursEndLocalTime) * 60,
    ];
    const nextBoundaryDelaySeconds = Math.min(...boundarySeconds.map((boundarySecond) => {
        const delta = boundarySecond - currentSecondOfDay;
        return delta <= 0 ? delta + 24 * 60 * 60 : delta;
    }));
    return new Date(from.getTime() + nextBoundaryDelaySeconds * 1000);
}
//# sourceMappingURL=notification-preference-time.util.js.map