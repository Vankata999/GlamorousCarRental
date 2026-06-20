"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { priceFor, toUTCDay } from "@/lib/pricing";

export type BookResult =
  | { ok: true; price: number }
  | { ok: false; error: string };

export async function createReservation(
  _prev: BookResult,
  formData: FormData,
): Promise<BookResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in to book." };
  const userId = session.user.id;

  const carId = String(formData.get("carId") ?? "");
  const fromRaw = String(formData.get("from") ?? "");
  const toRaw = String(formData.get("to") ?? "");
  if (!carId || !fromRaw || !toRaw)
    return { ok: false, error: "Pick a start and end date." };

  const start = toUTCDay(new Date(fromRaw));
  const end = toUTCDay(new Date(toRaw));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return { ok: false, error: "Those dates are invalid." };
  if (end < start)
    return { ok: false, error: "The end date is before the start date." };
  if (start < toUTCDay(new Date()))
    return { ok: false, error: "You cannot book dates in the past." };

  try {
    // Re-check availability and create inside a transaction so two overlapping
    // bookings can't both succeed. Inclusive-range overlap:
    //   existingStart <= newEnd AND existingEnd >= newStart
    const price = await db.$transaction(async (tx) => {
      const car = await tx.car.findUnique({
        where: { id: carId },
        select: { id: true },
      });
      if (!car) throw new Error("CAR_NOT_FOUND");

      const clash = await tx.reservation.findFirst({
        where: { carId, startDate: { lte: end }, endDate: { gte: start } },
        select: { id: true },
      });
      if (clash) throw new Error("CONFLICT");

      const p = priceFor(carId, start, end);
      await tx.reservation.create({
        data: { userId, carId, startDate: start, endDate: end, price: p },
      });
      return p;
    });

    revalidatePath("/");
    revalidatePath("/reservations");
    return { ok: true, price };
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT")
      return {
        ok: false,
        error: "Those dates are no longer available. Please pick another range.",
      };
    if (error instanceof Error && error.message === "CAR_NOT_FOUND")
      return { ok: false, error: "That car no longer exists." };
    return {
      ok: false,
      error: "Could not complete the booking. Please try again.",
    };
  }
}

export async function cancelReservation(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = String(formData.get("reservationId") ?? "");
  if (!id) return;

  // Scoping the delete to the owner means another user's id matches no rows.
  await db.reservation.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath("/reservations");
  revalidatePath("/");
}
