import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CancelButton } from "@/components/CancelButton";

// Dates are stored at UTC midnight, so format in UTC to show the picked day.
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reservations = await db.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      price: true,
      car: { select: { model: true, year: true, fuel: true } },
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900">
        Your reservations
      </h1>

      {reservations.length === 0 ? (
        <p className="text-gray-500">You have no reservations yet.</p>
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{r.car.model}</h2>
                <p className="text-sm text-gray-500">
                  {r.car.year} · {r.car.fuel}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {dateFmt.format(r.startDate)} – {dateFmt.format(r.endDate)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  ${r.price}
                </span>
                <CancelButton reservationId={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
