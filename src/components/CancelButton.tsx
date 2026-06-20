"use client";

import { useFormStatus } from "react-dom";
import { cancelReservation } from "@/app/actions/reservations";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "Cancelling…" : "Cancel"}
    </button>
  );
}

export function CancelButton({ reservationId }: { reservationId: string }) {
  return (
    <form action={cancelReservation}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <SubmitButton />
    </form>
  );
}
