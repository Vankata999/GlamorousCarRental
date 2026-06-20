import Image from "next/image";
import { CarDatePicker } from "@/components/CarDatePicker";
import { dayKey } from "@/lib/pricing";

export type CarWithReservations = {
  id: string;
  model: string;
  year: number;
  fuel: string;
  imageUrl: string;
  reservations: { startDate: Date; endDate: Date }[];
};

export function CarCard({
  car,
  priority = false,
  userBusyRanges = [],
}: {
  car: CarWithReservations;
  priority?: boolean;
  userBusyRanges?: { from: string; to: string }[];
}) {
  // Days to disable in this car's calendar: the car's own bookings, plus the
  // current user's bookings on any car (one person can't double-book themselves).
  const bookedRanges = [
    ...car.reservations.map((r) => ({
      from: dayKey(r.startDate),
      to: dayKey(r.endDate),
    })),
    ...userBusyRanges,
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        <Image
          src={car.imageUrl}
          alt={`${car.model} (${car.year})`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{car.model}</h2>
          <p className="text-sm text-gray-500">
            {car.year} · {car.fuel}
          </p>
        </div>
        <CarDatePicker carId={car.id} bookedRanges={bookedRanges} />
      </div>
    </article>
  );
}
