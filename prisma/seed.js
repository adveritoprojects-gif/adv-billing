require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");
const util = require("util");
const fs = require("fs");
const path = require("path");

const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

const sql = neon(process.env.DATABASE_URL);
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "db.json"), "utf-8")
);

const now = new Date().toISOString();

async function main() {
  console.log("Seeding Patient...");
  for (const p of data.patients) {
    await sql`
      INSERT INTO "Patient" (id, name, age, gender, phone, address, "createdAt", "updatedAt")
      VALUES (${p.id}, ${p.name}, ${p.age}, ${p.gender}, ${p.phone || ""}, ${p.address || ""}, ${now}, ${now})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`  ${data.patients.length} patients seeded`);

  console.log("Seeding XRay...");
  for (const x of data.xrays) {
    await sql`
      INSERT INTO "XRay" (id, "patientId", type, part, view, date, radiologist, cost, "createdAt")
      VALUES (${x.id}, ${x.patientId}, ${x.type}, ${x.part}, ${x.view}, ${x.date}, ${x.radiologist}, ${x.cost}, ${now})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`  ${data.xrays.length} xrays seeded`);

  console.log("Seeding Invoice...");
  for (const inv of data.invoices) {
    await sql`
      INSERT INTO "Invoice" (id, "patientId", date, "discountPct", "taxPct", "insurancePct", subtotal, "discountAmt", "taxAmt", "insuranceAmt", total, paid, due, status, mode, "createdAt", "updatedAt")
      VALUES (${inv.id}, ${inv.patientId}, ${inv.date}, ${inv.discountPct || 0}, ${inv.taxPct || 0}, ${inv.insurancePct || 0}, ${inv.subtotal}, ${inv.discountAmt || 0}, ${inv.taxAmt || 0}, ${inv.insuranceAmt || 0}, ${inv.total}, ${inv.paid || 0}, ${inv.due || 0}, ${inv.status}, ${inv.mode}, ${now}, ${now})
      ON CONFLICT (id) DO NOTHING
    `;
    await sql`DELETE FROM "InvoiceItem" WHERE "invoiceId" = ${inv.id}`;
    for (const it of inv.items || []) {
      const itemId = crypto.randomUUID();
      await sql`
        INSERT INTO "InvoiceItem" (id, "invoiceId", description, amount)
        VALUES (${itemId}, ${inv.id}, ${it.desc}, ${it.amount})
      `;
    }
  }
  console.log(`  ${data.invoices.length} invoices seeded`);

  const adminUsername =
    (process.env.STAFF_SEED_USERNAME || "admin").toLowerCase().trim();
  const adminPassword = process.env.STAFF_SEED_PASSWORD || "admin123";
  const adminHash = await hashPassword(adminPassword);

  await sql`
    INSERT INTO "Staff" (id, username, "passwordHash", name, role, "createdAt", "updatedAt")
    VALUES ('S-1001', ${adminUsername}, ${adminHash}, ${process.env.STAFF_SEED_NAME || "Administrator"}, 'Admin', ${now}, ${now})
    ON CONFLICT (id) DO NOTHING
  `;
  console.log(`  Admin staff seeded (username: ${adminUsername})`);

  const counts = await sql`
    SELECT
      (SELECT count(*)::int FROM "Patient") AS patients,
      (SELECT count(*)::int FROM "XRay") AS xrays,
      (SELECT count(*)::int FROM "Invoice") AS invoices,
      (SELECT count(*)::int FROM "InvoiceItem") AS items,
      (SELECT count(*)::int FROM "Staff") AS staff
  `;
  console.log("\nFinal counts:", counts[0]);
  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
