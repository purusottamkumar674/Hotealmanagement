export function csvCell(value: string | number) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
  return '"' + safe.replaceAll('"', '""') + '"';
}
