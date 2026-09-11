"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { CONSULT_FEE, PAY_MODES, fmt, today } from "@/lib/constants";
import { useMode } from "@/components/ModeContext";
import { Field, TextInput, Select, SectionHeader } from "@/components/ui";
import InvoiceReceipt from "@/components/InvoiceReceipt";

export default function BillingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-inkSoft">Loading…</p>}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get("patientId") || "";
  const { isAdvanced } = useMode();

  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [patientId, setPatientId] = useState("");
  const [includeConsult, setIncludeConsult] = useState(true);
  const [selectedXrayIds, setSelectedXrayIds] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [customDesc, setCustomDesc] = useState("");
  const [customAmt, setCustomAmt] = useState("");

  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [insurancePct, setInsurancePct] = useState(0);
  const [payMode, setPayMode] = useState("Cash");
  const [payStatus, setPayStatus] = useState("Paid");
  const [amountPaid, setAmountPaid] = useState("");
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/xrays").then((r) => r.json()),
    ]).then(([p, x]) => {
      setPatients(p);
      setXrays(x);
      setPatientId(prefillPatientId || p[0]?.id || "");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patientXrays = xrays.filter((x) => x.patientId === patientId);

  const toggleXray = (id) =>
    setSelectedXrayIds((sel) => (sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]));

  const addCustomItem = () => {
    if (!customDesc.trim() || !customAmt) return;
    setCustomItems([...customItems, { desc: customDesc, amount: Number(customAmt) }]);
    setCustomDesc(""); setCustomAmt("");
  };
  const removeCustomItem = (idx) => setCustomItems(customItems.filter((_, i) => i !== idx));

  const lineItems = useMemo(() => {
    const items = [];
    if (includeConsult) items.push({ desc: "Consultation", amount: CONSULT_FEE });
    patientXrays
      .filter((x) => selectedXrayIds.includes(x.id))
      .forEach((x) => items.push({ desc: `X-Ray — ${x.type}`, amount: x.cost }));
    customItems.forEach((c) => items.push(c));
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeConsult, selectedXrayIds, customItems, patientId]);

  const subtotal = lineItems.reduce((s, i) => s + Number(i.amount || 0), 0);
  const discountAmt = isAdvanced ? (subtotal * discountPct) / 100 : 0;
  const taxable = subtotal - discountAmt;
  const taxAmt = isAdvanced ? (taxable * taxPct) / 100 : 0;
  const insuranceAmt = isAdvanced ? ((taxable + taxAmt) * insurancePct) / 100 : 0;
  const total = Math.max(0, taxable + taxAmt - insuranceAmt);

  const effectivePaid = payStatus === "Paid" ? total : payStatus === "Unpaid" ? 0 : Number(amountPaid) || 0;
  const due = Math.max(0, total - effectivePaid);
  const finalStatus = due <= 0.005 ? "Paid" : effectivePaid === 0 ? "Unpaid" : "Partial";

  const resetForm = () => {
    setIncludeConsult(true); setSelectedXrayIds([]); setCustomItems([]);
    setDiscountPct(0); setTaxPct(0); setInsurancePct(0);
    setPayMode("Cash"); setPayStatus("Paid"); setAmountPaid("");
  };

  const generateInvoice = async () => {
    if (!patientId || lineItems.length === 0) return;
    setSubmitting(true);
    const payload = {
      patientId, date: today(), items: lineItems,
      discountPct: isAdvanced ? discountPct : 0, taxPct: isAdvanced ? taxPct : 0, insurancePct: isAdvanced ? insurancePct : 0,
      subtotal, discountAmt, taxAmt, insuranceAmt, total,
      paid: effectivePaid, due, status: finalStatus, mode: isAdvanced ? payMode : "Cash",
    };
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      setSavedInvoice(created);
      resetForm();
    }
    setSubmitting(false);
  };

  if (loading) return <p className="text-sm text-inkSoft">Loading…</p>;

  const patient = patients.find((p) => p.id === patientId);

  if (savedInvoice) {
    const p = patients.find((pt) => pt.id === savedInvoice.patientId);
    return (
      <div>
        <SectionHeader title="Invoice created" subtitle={savedInvoice.id} />
        <InvoiceReceipt
          invoice={savedInvoice}
          patient={p}
          onDone={() => router.push("/invoices")}
          onNew={() => setSavedInvoice(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="New bill" subtitle="Build an itemized invoice for a patient visit" />

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-lg bg-white p-4 border border-border">
            <Field label="Patient">
              <Select value={patientId} onChange={(e) => { setPatientId(e.target.value); setSelectedXrayIds([]); }}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}
              </Select>
            </Field>
          </div>

          <div className="rounded-lg bg-white p-4 border border-border">
            <h3 className="text-[15px] font-medium mb-2 text-ink">Line items</h3>
            <label className="flex items-center gap-2 text-sm py-1.5 cursor-pointer">
              <input type="checkbox" checked={includeConsult} onChange={(e) => setIncludeConsult(e.target.checked)} />
              <span className="text-ink">Consultation fee</span>
              <span className="ml-auto text-inkSoft tabular-nums">{fmt(CONSULT_FEE)}</span>
            </label>

            {patientXrays.length > 0 && (
              <div className="mt-1 mb-2">
                <div className="text-xs mt-2 mb-1 text-inkSoft">X-rays on file for this patient</div>
                {patientXrays.map((x) => (
                  <label key={x.id} className="flex items-center gap-2 text-sm py-1.5 cursor-pointer">
                    <input type="checkbox" checked={selectedXrayIds.includes(x.id)} onChange={() => toggleXray(x.id)} />
                    <span className="text-ink">{x.type} <span className="text-inkSoft">({x.date})</span></span>
                    <span className="ml-auto text-inkSoft tabular-nums">{fmt(x.cost)}</span>
                  </label>
                ))}
              </div>
            )}

            {customItems.length > 0 && (
              <div className="mt-2 border-t border-border pt-2">
                {customItems.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm py-1.5">
                    <span className="text-ink">{c.desc}</span>
                    <span className="ml-auto text-inkSoft tabular-nums">{fmt(c.amount)}</span>
                    <button onClick={() => removeCustomItem(idx)}><Trash2 size={14} className="text-rose" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <TextInput placeholder="Other charge (e.g. bandage)" value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} className="flex-1" />
              <TextInput placeholder="Amt" type="number" value={customAmt} onChange={(e) => setCustomAmt(e.target.value)} className="w-20" />
              <button onClick={addCustomItem} className="rounded-md px-3 text-sm text-white bg-teal">Add</button>
            </div>
          </div>

          {isAdvanced && (
            <div className="rounded-lg bg-white p-4 grid sm:grid-cols-3 gap-3 border border-border">
              <Field label="Discount %">
                <TextInput type="number" value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Tax / GST %">
                <TextInput type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value) || 0)} />
              </Field>
              <Field label="Insurance covers %">
                <TextInput type="number" value={insurancePct} onChange={(e) => setInsurancePct(Number(e.target.value) || 0)} />
              </Field>
            </div>
          )}

          <div className="rounded-lg bg-white p-4 grid sm:grid-cols-2 gap-3 border border-border">
            <Field label="Payment status">
              <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
                <option>Paid</option>
                {isAdvanced && <option>Partial</option>}
                <option>Unpaid</option>
              </Select>
            </Field>
            {isAdvanced && payStatus === "Partial" && (
              <Field label="Amount paid now">
                <TextInput type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
              </Field>
            )}
            {isAdvanced && (
              <Field label="Payment mode">
                <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                  {PAY_MODES.map((m) => <option key={m}>{m}</option>)}
                </Select>
              </Field>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-4 sticky top-4 border border-border">
            <h3 className="text-[15px] font-medium mb-1 text-ink">Invoice preview</h3>
            <p className="text-xs mb-3 text-inkSoft">{patient ? `${patient.name} · ${patient.id}` : "No patient selected"}</p>
            <div className="text-sm divide-y divide-border">
              {lineItems.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <span className="text-ink">{it.desc}</span>
                  <span className="tabular-nums text-ink">{fmt(it.amount)}</span>
                </div>
              ))}
              {lineItems.length === 0 && <p className="py-3 text-xs text-inkSoft">Add items to see the total.</p>}
            </div>
            <div className="mt-2 pt-2 border-t border-border text-sm space-y-1">
              <div className="flex justify-between text-inkSoft"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
              {isAdvanced && discountAmt > 0 && <div className="flex justify-between text-inkSoft"><span>Discount ({discountPct}%)</span><span className="tabular-nums">−{fmt(discountAmt)}</span></div>}
              {isAdvanced && taxAmt > 0 && <div className="flex justify-between text-inkSoft"><span>Tax ({taxPct}%)</span><span className="tabular-nums">+{fmt(taxAmt)}</span></div>}
              {isAdvanced && insuranceAmt > 0 && <div className="flex justify-between text-inkSoft"><span>Insurance covers</span><span className="tabular-nums">−{fmt(insuranceAmt)}</span></div>}
              <div className="flex justify-between pt-1 text-base font-head text-ink">
                <span>Total due</span><span className="tabular-nums">{fmt(total)}</span>
              </div>
              {due > 0.005 && <div className="flex justify-between text-xs text-rose"><span>Outstanding after this payment</span><span className="tabular-nums">{fmt(due)}</span></div>}
            </div>
            <button
              onClick={generateInvoice}
              disabled={!patientId || lineItems.length === 0 || submitting}
              className="w-full mt-4 rounded-md py-2.5 text-sm text-white bg-tealDeep disabled:opacity-40"
            >
              {submitting ? "Generating…" : "Generate invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
