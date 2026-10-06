const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parses "YYYY-MM-DD" or an ISO datetime as local time (avoids UTC day shifts). */
export function parseLocal(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  if (!timePart) return new Date(y, m - 1, d);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm ?? 0);
}

export function formatDate(value: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const date = parseLocal(value);
  const parts = [`${MONTHS[date.getMonth()]} ${date.getDate()}`];
  if (opts.year !== false) parts[0] += `, ${date.getFullYear()}`;
  return opts.weekday ? `${DAYS[date.getDay()]}, ${parts[0]}` : parts[0];
}

export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start, { weekday: true });
  const s = parseLocal(start);
  const e = parseLocal(end);
  if (s.getMonth() === e.getMonth()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatDate(start, { year: false })} – ${formatDate(end)}`;
}

export function formatTime(value: string): string {
  const date = parseLocal(value);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${minutes} ${suffix}`;
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

export function isUpcoming(dateIso: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocal(dateIso) >= today;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
