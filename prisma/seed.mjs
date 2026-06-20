import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Car ids are stable slugs so re-seeding is idempotent and the deterministic
// price (seeded by car id) stays consistent across reseeds.
const cars = [
  { id: "corolla", model: "Toyota Corolla", year: 2021, fuel: "Petrol", imageUrl: "/cars/corolla.svg" },
  { id: "model-3", model: "Tesla Model 3", year: 2023, fuel: "Electric", imageUrl: "/cars/model-3.svg" },
  { id: "golf", model: "Volkswagen Golf", year: 2020, fuel: "Diesel", imageUrl: "/cars/golf.svg" },
  { id: "civic", model: "Honda Civic", year: 2022, fuel: "Petrol", imageUrl: "/cars/civic.svg" },
  { id: "focus", model: "Ford Focus", year: 2019, fuel: "Diesel", imageUrl: "/cars/focus.svg" },
  { id: "ioniq-5", model: "Hyundai Ioniq 5", year: 2023, fuel: "Electric", imageUrl: "/cars/ioniq-5.svg" },
  { id: "3-series", model: "BMW 3 Series", year: 2022, fuel: "Petrol", imageUrl: "/cars/3-series.svg" },
  { id: "clio", model: "Renault Clio", year: 2021, fuel: "Petrol", imageUrl: "/cars/clio.svg" },
];

async function main() {
  for (const car of cars) {
    await prisma.car.upsert({ where: { id: car.id }, update: car, create: car });
  }
  console.log(`Seeded ${cars.length} cars.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
