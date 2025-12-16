// Utilities for handling local date-time strings (without timezone)
export function parseLocalDateTimeToDate(localIso) {
  if (!localIso) return null;
  // Accept formats: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  const [datePart, timePart = '00:00:00'] = localIso.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const timePieces = timePart.split(':').map(Number);
  const hour = timePieces[0] || 0;
  const minute = timePieces[1] || 0;
  const second = timePieces[2] || 0;
  return new Date(year, month - 1, day, hour, minute, second);
}

export function toLocalIsoWithoutSeconds(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function ensureLocalIsoHasSeconds(localIso) {
  if (!localIso) return null;
  if (localIso.length === 16) return `${localIso}:00`;
  return localIso;
}
