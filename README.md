# Riverside Clinic — Billing Software

A Next.js (App Router) clinic billing application: patient records, x-ray
records, itemized invoicing with a Basic/Advanced mode toggle, and simple
financial reporting.

## Getting started

Requires Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What's included

- **Patients** — register patients, search, see x-ray count per patient.
- **X-Ray records** — log studies (type, view, radiologist, date, cost)
  against a patient.
- **New bill** — pick a patient, pull in their x-rays as line items, add
  consultation fee and ad-hoc charges, then generate an invoice. In
  Advanced mode you also get discount %, tax/GST %, insurance coverage %,
  partial payments, and payment mode.
- **Invoices** — searchable, filterable, expandable invoice history with a
  printable receipt (browser print dialog).
- **Reports** (Advanced mode only) — revenue by payment mode and a list of
  outstanding balances.

The Basic/Advanced toggle lives in the top bar and is remembered per
browser (localStorage).

## Data storage

Data is stored in `data/db.json` on the server and read/written by the API
routes in `app/api/*`. That's enough for running the app on your own
machine or a normal Node server (`npm run start`), but **it will not work
on a serverless platform with a read-only or ephemeral filesystem** (e.g.
Vercel's default deployment) — writes will silently fail to persist there.

To move to a real database later, everything the app needs goes through
three functions in `lib/db.js` (`readDB`, `writeDB`, `uid`). Swap that
module's implementation for calls to Postgres/MySQL/SQLite/etc. and the
rest of the app (API routes, pages) doesn't need to change.

## Project structure

```
app/
  api/patients, api/xrays, api/invoices   – REST-ish JSON endpoints
  page.js                                 – dashboard
  patients/, xrays/, billing/, invoices/, reports/
  layout.js, globals.css
components/                               – Shell, ModeContext, InvoiceReceipt, shared UI bits
lib/
  db.js         – JSON file data store
  constants.js  – x-ray types, payment modes, formatting helpers
data/db.json    – the data file itself (seeded with sample records)
```

## Notes / next steps you may want

- Add authentication (staff login) before using this with real patient data.
- Add edit/delete for patients, x-rays, and invoices (currently create + read only).
- Replace the JSON file store with a proper database for multi-user / production use.
- Add PDF export for invoices instead of relying on browser print.
