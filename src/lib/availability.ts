import type { Prisma } from "@prisma/client";

/**
 * Two inclusive day ranges overlap iff `aStart <= bEnd AND aEnd >= bStart`.
 * This is the rule the booking action enforces; `overlapWhere` is its
 * translation into a Prisma filter (the DB does the actual filtering).
 */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return (
    aStart.getTime() <= bEnd.getTime() && aEnd.getTime() >= bStart.getTime()
  );
}

/** Prisma `where` fragment matching reservations that overlap `[start, end]`. */
export function overlapWhere(
  start: Date,
  end: Date,
): Pick<Prisma.ReservationWhereInput, "startDate" | "endDate"> {
  return { startDate: { lte: end }, endDate: { gte: start } };
}
