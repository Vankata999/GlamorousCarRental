"use client";

import { useActionState, useEffect, useState } from "react";
import {
  DayPicker,
  type DateRange,
  type Matcher,
} from "react-day-picker";
import "react-day-picker/style.css";
import { nightsBilled, priceFor } from "@/lib/pricing";
import { createReservation, type BookResult } from "@/app/actions/reservations";

type BookedRange = { from: string; to: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" for the LOCAL calendar day shown in the calendar. */
function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** UTC-midnight Date for that calendar day so pricing matches the server hash. */
function toUTCDayFromLocal(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Parse a booked "YYYY-MM-DD" into a LOCAL-midnight Date for rdp's matcher. */
function parseLocalDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function CarDatePicker({
  carId,
  bookedRanges,
}: {
  carId: string;
  bookedRanges: BookedRange[];
}) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [state, formAction, pending] = useActionState<BookResult, FormData>(
    createReservation,
    { ok: false, error: "" },
  );

  // After a successful booking, clear the selection. The just-booked days come
  // back as disabled via fresh props once the page revalidates.
  useEffect(() => {
    if (state.ok) setRange(undefined);
  }, [state]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabled: Matcher[] = [
    { before: today },
    ...bookedRanges.map((r) => ({
      from: parseLocalDay(r.from),
      to: parseLocalDay(r.to),
    })),
  ];

  const from = range?.from;
  const to = range?.to;
  const complete = Boolean(from && to);
  const price =
    from && to ? priceFor(carId, toUTCDayFromLocal(from), toUTCDayFromLocal(to)) : null;
  const nights =
    from && to ? nightsBilled(toUTCDayFromLocal(from), toUTCDayFromLocal(to)) : 0;

  return (
    <div className="mt-auto space-y-3">
      <div className="flex justify-center rounded-xl border border-gray-200 p-1">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={disabled}
          excludeDisabled
          min={1}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {complete ? `${nights} night${nights === 1 ? "" : "s"}` : "Select your dates"}
        </span>
        <span className="text-base font-semibold text-gray-900">
          {price !== null ? `$${price}` : "—"}
        </span>
      </div>

      <form action={formAction}>
        <input type="hidden" name="carId" value={carId} />
        <input type="hidden" name="from" value={from ? localDayKey(from) : ""} />
        <input type="hidden" name="to" value={to ? localDayKey(to) : ""} />
        <button
          type="submit"
          disabled={!complete || pending}
          className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Booking…" : "Book"}
        </button>
      </form>

      {!state.ok && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-green-600">Booked! Total ${state.price}.</p>
      )}
    </div>
  );
}
