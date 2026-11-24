export function isoToday(offset = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((p) => p.type === type)!.value;
  const local = new Date(
    Date.UTC(
      Number(value("year")),
      Number(value("month")) - 1,
      Number(value("day")) + offset,
    ),
  );
  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}`;
}
export function isValidISO(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T00:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === date;
}
export function nightsBetween(start: string, end: string): number {
  if (!isValidISO(start) || !isValidISO(end)) return 0;
  return Math.round(
    (Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) /
      86400000,
  );
}
export function eachNight(start: string, end: string): string[] {
  const count = nightsBetween(start, end);
  if (count <= 0 || count > 365) return [];
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.parse(start + "T00:00:00Z") + i * 86400000)
      .toISOString()
      .slice(0, 10),
  );
}
export function formatDate(
  date: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!isValidISO(date)) return date;
  return new Date(date + "T12:00:00Z").toLocaleDateString(
    "en-IN",
    options || {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}
export function formatShortDate(date: string): string {
  return formatDate(date, { day: "numeric", month: "short", timeZone: "UTC" });
}
export function dateIsWeekend(date: string): boolean {
  const day = new Date(date + "T00:00:00Z").getUTCDay();
  return day === 0 || day === 6;
}
export function dateValidStay(start: string, end: string): boolean {
  const n = nightsBetween(start, end);
  return isValidISO(start) && start >= isoToday() && n > 0 && n <= 30;
}
