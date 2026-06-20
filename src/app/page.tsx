import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toUTCDay } from "@/lib/pricing";
import { CarCard } from "@/components/CarCard";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // One query: every car plus its current/future bookings (so the calendar can
  // disable taken days without any extra requests).
  const today = toUTCDay(new Date());
  const cars = await db.car.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      model: true,
      year: true,
      fuel: true,
      imageUrl: true,
      reservations: {
        where: { endDate: { gte: today } },
        select: { startDate: true, endDate: true },
        orderBy: { startDate: "asc" },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">
        Available cars
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Pick your rental dates on a car to see the price and book it.
      </p>

      {cars.length === 0 ? (
        <p className="text-gray-500">No cars available right now.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car, i) => (
            <li key={car.id}>
              <CarCard car={car} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
