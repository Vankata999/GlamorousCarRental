# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

GlamorousCarRental — a car rental web app. Logged-in users browse cars, pick a rental period on a calendar, and book or cancel; each booking is priced for the chosen dates. Server-Component-first; all data access and secrets stay on the server.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Auth.js v5 (Credentials) · Prisma 6 + SQLite · Tailwind CSS v4 · react-day-picker v10 · Vitest. This is **Next.js 16**: its APIs, conventions, and file layout can differ from older versions and from model training data — read the relevant guide under `node_modules/next/dist/docs/` before using unfamiliar framework APIs, and heed deprecation notices.

## Commands

```bash
npm run dev                              # dev server at http://localhost:3000
npm run build                            # production build (also typechecks; *.test.ts excluded)
npm run lint                             # eslint
npm test                                 # run the Vitest suite once
npx vitest run src/lib/pricing.test.ts   # a single test file
npx vitest run -t "deterministic"        # tests matching a name
npx vitest                               # watch mode

npx prisma migrate dev                   # create/apply a migration
npm run db:seed                          # seed 8 cars (prisma db seed -> node prisma/seed.mjs)
npx prisma studio                        # browse the database
```

`.env` (gitignored; copy from `.env.example`) must define `DATABASE_URL` and `AUTH_SECRET`. `npm install` runs `prisma generate` via `postinstall`. The SQLite file is `prisma/dev.db`; its `file:./dev.db` URL resolves relative to `prisma/schema.prisma`, so app, seed, and CLI share the same DB regardless of cwd.

## Architecture

**Server-first, no REST API.** Pages are Server Components that query Prisma directly; mutations are Server Actions in `src/app/actions/` (`auth.ts`, `reservations.ts`). The only route handler is the NextAuth catch-all at `src/app/api/auth/[...nextauth]/route.ts`. Client Components exist only where interactivity requires them (the calendar, auth forms, cancel button).

**Auth (`src/auth.ts`).** One NextAuth config, Credentials provider, **JWT sessions** (required by Credentials). There is no middleware/proxy: every protected page (`/`, `/profile`, `/reservations`) calls `auth()` itself and `redirect("/login")` when unauthenticated, and every Server Action re-checks `auth()`. The session callback exposes `user.id`, type-augmented in `src/types/next-auth.d.ts`. Profile pictures are generated initials avatars (`src/components/Avatar.tsx`), not stored.

**Deterministic shared pricing (`src/lib/pricing.ts`).** A pure, secret-free `priceFor(carId, start, end)` is imported by **both** the client calendar (live preview) and the booking Server Action (authoritative stored value), so the displayed price always equals the stored one. Keep this module free of `Math.random`, `Date.now`, and server-only imports.

**Dates are UTC-day values.** Reservations store `startDate`/`endDate` at UTC midnight; `toUTCDay`/`dayKey` (in `pricing.ts`) normalize to a UTC calendar day for hashing and comparison. The calendar UI works in *local* days but converts the picked day to UTC midnight for pricing and sends date-only `YYYY-MM-DD` strings across the server boundary. Preserve this or client/server prices and disabled-day sets drift by a day; render stored dates with `timeZone: "UTC"`.

**Booking & availability (`src/app/actions/reservations.ts` + `src/lib/availability.ts`).** `createReservation` runs inside `db.$transaction` and re-checks both that the car is free and that the user has no overlapping reservation before writing — preventing double-booking *and* one person holding two overlapping rentals. The inclusive-range overlap rule (`existingStart <= newEnd AND existingEnd >= newStart`) lives in `availability.ts` as `overlapWhere` (the Prisma filter the action uses) and `rangesOverlap` (the same rule as a pure predicate, exercised by tests). `cancelReservation` is an owner-scoped `deleteMany`. Both revalidate `/` and `/reservations`.

**Minimize network requests.** The car-list page (`src/app/page.tsx`) makes a single query — all cars plus their future reservation ranges plus the current user's own busy ranges — and passes minimal serializable data to `CarCard` → `CarDatePicker`, which disables booked/past/user-busy days and computes the live price client-side with no further requests. Booking and cancel are single Server Action round-trips.

**Data & seed.** Models: `User`, `Car`, `Reservation` (indexed on `carId` and `userId`). `prisma/seed.mjs` upserts 8 cars with **stable slug ids** (e.g. `corolla`); the slug is the pricing hash seed, so ids must not change across reseeds. Car photos are local JPEGs at `public/cars/<slug>.jpg`.

## Conventions

- `@/*` resolves to `src/*`.
- Tailwind v4 is configured in `src/app/globals.css` (`@import "tailwindcss"`) — there is no `tailwind.config.js`.
- Test files are colocated in `src/lib/` (`*.test.ts`), excluded from the Next build via `tsconfig.json`, and run only under Vitest.
