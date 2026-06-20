// Deterministic, pure pricing + date helpers shared by BOTH the client (live
// price preview) and the server action (authoritative stored price).
//
// No secrets, no server-only imports, no Math.random / Date.now. The same
// (carId, start, end) always produces the same integer on any JS engine, so the
// price shown in the calendar is exactly the price stored on the reservation.

const MS_PER_DAY = 86_400_000;

/** Strip a date to UTC midnight so day math ignores time-of-day and timezone. */
export function toUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Stable "YYYY-MM-DD" key in UTC, used for hashing and equality. */
export function dayKey(d: Date): string {
  return toUTCDay(d).toISOString().slice(0, 10);
}

/** Inclusive day span: the 10th to the 12th is 3 days. */
export function daysInclusive(start: Date, end: Date): number {
  return (
    Math.round(
      (toUTCDay(end).getTime() - toUTCDay(start).getTime()) / MS_PER_DAY,
    ) + 1
  );
}

/** Billable nights = inclusive days − 1, floored at 1 (a single day costs one). */
export function nightsBilled(start: Date, end: Date): number {
  return Math.max(1, daysInclusive(start, end) - 1);
}

/** djb2-xor string hash → unsigned 32-bit int. Deterministic across engines. */
function hash32(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

const RATE_MIN = 30; // per-day floor in currency units
const RATE_SPAN = 120; // band width → per-day rate in [30, 149]

/** Per-day rate for a car on a given start day (the "random for the dates"). */
function perDayRate(carId: string, start: Date): number {
  return RATE_MIN + (hash32(`${carId}|${dayKey(start)}`) % RATE_SPAN);
}

/**
 * Authoritative rental price. Called identically by the client preview and the
 * booking server action, so the displayed total always equals the stored total.
 */
export function priceFor(carId: string, start: Date, end: Date): number {
  return perDayRate(carId, start) * nightsBilled(start, end);
}
