# AGENTS.md

## Stack

Next.js 14 (App Router), plain JavaScript (no TypeScript), Tailwind v3, lucide-react.
Path alias `@/*` → project root (`jsconfig.json`).
Currency: Indian Rupees (₹) via `lib/constants.js` `fmt()`.

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` / `npm run start`
- `npm run lint` is broken: eslint is not installed or configured. Do not rely on it.
- No test framework. No test files.

## Data layer

All persistence goes through `lib/db.js` (`readDB`, `writeDB`, `uid`), backed by `data/db.json` (committed, seeded).
Three API routes (`app/api/{patients,xrays,invoices}/route.js`) — all import `@/lib/db`.
JSON store will not persist on read-only/ephemeral filesystems (Vercel serverless).

## Architecture

All page components are client components (`"use client"`). Data fetching happens client-side via `fetch("/api/...")` calls in `useEffect` hooks.
No server components access the database directly.
`app/billing/page.js` uses `<Suspense>` around `useSearchParams()` — required for Next.js App Router.

## Pages

| Route        | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `/`          | Dashboard — stats, recent invoices, quick actions  |
| `/patients`  | Patient list + registration form + search          |
| `/xrays`     | X-ray record list + logging form                   |
| `/billing`   | Invoice builder: patient → line items → preview → generate |
| `/invoices`  | Searchable/filterable invoice list with expandable rows |
| `/reports`   | Revenue by payment mode, outstanding balances      |

## Key models (JSON store)

- `patients` — `id` (P-XXXX), name, age, gender, phone, address
- `xrays` — `id` (X-XXXX), patientId, type, part, view, date, radiologist, cost
- `invoices` — `id` (INV-XXXX), patientId, date, items[{desc,amount}], discount/tax/insurance percentages + amounts, subtotal, total, paid, due, status (Paid|Partial|Unpaid), mode (Cash|Card|UPI|Insurance)

## Prisma 7 migration (IN PROGRESS)

Untracked files: `prisma/schema.prisma`, `prisma7.config.ts`, `.env`, Prisma v7 deps in `package.json`.
App code does NOT use Prisma yet. `lib/generated/prisma` does not exist. JSON store is still the running data path.

Schema is multi-tenant (Clinic → Patient/XRay/Invoice/InvoiceItem). Existing JSON records have no `clinicId` — mapping is unfinished.
Missing for v7: driver adapter (`@prisma/adapter-neon`), explicit generator `output` path, client generation.
Node requirement: Prisma 7 requires Node ≥20.19 (README says 18.18+ — conflict).
Use the bundled `prisma-upgrade-v7` / `prisma-*` skills for migration details.

## Env / secrets

`.gitignore` only covers `.env*.local`. The real `.env` (with Neon Postgres DATABASE_URL) is untracked — `git add .` would stage it. Do not commit secrets.
