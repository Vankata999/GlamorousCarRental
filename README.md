# GlamorousCarRental

A full-stack car rental web app. Signed-in users browse a fleet of cars, pick a rental period on a calendar, see a price for those dates, and book or cancel — with their reservation history one click away.

It's built **server-first** with the Next.js App Router: pages are Server Components that query the database directly, all mutations go through Server Actions (there is no REST API), and every secret stays on the server.

## Features

- **Email + password accounts** — sign up, log in, and log out (Auth.js v5, JWT sessions, bcrypt-hashed passwords). The header shows a "Sign in" button only when nobody is logged in.
- **Profile** — name, email, and a generated initials avatar.
- **Browse cars** — each card shows a photo, model, year, fuel, an inline calendar, and a live price for the dates you pick.
- **Calendar booking** — choose a date range; past days and days already taken (by that car, or by your own other bookings) are disabled, and the total updates instantly on the client.
- **Reservations** — create and cancel bookings; the history lists them newest-first with model, year, fuel, price, and dates.
- **Safe availability** — a database transaction prevents double-booking a car *and* stops one person from holding two reservations that overlap in time.
- **Deterministic pricing** — the price for a given car and date range is stable and identical between the calendar preview and the value stored on the reservation.

## Tech stack

| Area      | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 16 (App Router) · React 19                  |
| Language  | TypeScript                                          |
| Auth      | Auth.js v5 (Credentials provider, JWT sessions)     |
| Database  | Prisma 6 · SQLite                                   |
| Styling   | Tailwind CSS v4                                      |
| Calendar  | react-day-picker v10                                |
| Tests     | Vitest                                              |

## Getting started

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Install dependencies (postinstall also generates the Prisma client)
npm install

# 2. Create your environment file
cp .env.example .env
#    then set AUTH_SECRET in .env — generate one with:
#    node -e "console.log(require('crypto').randomBytes(33).toString('base64'))"

# 3. Create the local SQLite database and seed eight cars
npx prisma migrate dev
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>, sign up, and book a car.

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the local development server           |
| `npm run build`    | Production build (also type-checks)          |
| `npm start`        | Serve the production build                   |
| `npm test`         | Run the Vitest unit suite                    |
| `npm run lint`     | Run ESLint                                   |
| `npm run db:seed`  | Seed the database with cars                  |

## Project structure

```text
prisma/                  Schema, migrations, and the seed script
public/cars/             Car photos
src/
  auth.ts                Auth.js config (Credentials + JWT sessions)
  lib/
    db.ts                Prisma client singleton (HMR-safe)
    pricing.ts           Deterministic pricing, shared by client and server
    availability.ts      The reservation-overlap rule
  app/
    page.tsx             Car list (home)
    login/ signup/       Auth pages
    profile/             Profile page
    reservations/        Reservation history
    actions/             Server Actions (auth, reservations)
    api/auth/[...nextauth]/  Auth.js route handler
  components/            Header, CarCard, CarDatePicker, Avatar, forms
```

## How a few things work

- **Pricing** lives in a pure, secret-free module (`src/lib/pricing.ts`) imported by *both* the client calendar (live preview) and the booking Server Action (the authoritative, stored value), so the price you see always equals the price you're charged. Dates are normalized to UTC days, so pricing is timezone-stable.
- **Availability** is re-checked on the server inside a transaction before every booking: the car must be free, and you must have no other reservation overlapping the dates. The inclusive-range rule lives in `src/lib/availability.ts` and is unit-tested.
- **Auth** protects pages with a per-page `auth()` check (no middleware); a request without a session is redirected to `/login`. Server Actions re-verify the session before mutating.
- **One query per page load** — the car list fetches every car plus its upcoming bookings (and your own busy dates) in a single query, then computes prices on the client with no further requests.

## Testing

```bash
npm test
```

The Vitest suite (`src/lib/*.test.ts`) covers the pricing engine (determinism, timezone stability, night counting) and the availability rule (inclusive-range overlap, including the exact filter the booking action runs).

## Notes

- `.env` and the SQLite database file (`prisma/dev.db`) are git-ignored; copy `.env.example` to get started.
- Car photos under `public/cars/` are sourced from Wikimedia Commons.
