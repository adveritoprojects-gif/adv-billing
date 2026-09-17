import { Stethoscope, Printer } from "lucide-react";
import { fmt } from "@/lib/constants";
import { Badge } from "@/components/ui";

export default function InvoiceReceipt({ invoice, patient, onDone, onNew }) {
  return (
    <div className="max-w-md">
      <div className="rounded-lg bg-white p-5" style={{ border: "1px dashed #CBD8CF" }}>
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope size={16} className="text-tealDeep" />
          <span className="text-[15px] font-head text-ink">Riverside Family Clinic</span>
        </div>
        <p className="text-xs mb-3 text-inkSoft">Invoice {invoice.id} · {invoice.date}</p>
        <p className="text-sm mb-3 text-ink">
          {patient ? patient.name : "—"} <span className="text-inkSoft">({patient ? patient.id : ""})</span>
        </p>
        <div className="text-sm divide-y divide-border">
          {invoice.items.map((it, idx) => (
            <div key={idx} className="flex justify-between py-1.5">
              <span className="text-ink">{it.description ?? it.desc}</span>
              <span className="tabular-nums">{fmt(it.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-border text-sm space-y-1">
          <div className="flex justify-between text-base font-head text-ink">
            <span>Total</span><span className="tabular-nums">{fmt(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-inkSoft">
            <span>Paid ({invoice.mode})</span><span className="tabular-nums">{fmt(invoice.paid)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-inkSoft">Status</span><Badge status={invoice.status} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 no-print">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2.5 text-sm text-white bg-teal"
        >
          <Printer size={15} /> Print
        </button>
        <button onClick={onNew} className="flex-1 rounded-md py-2.5 text-sm border border-border text-ink">
          New bill
        </button>
        <button onClick={onDone} className="flex-1 rounded-md py-2.5 text-sm text-white bg-tealDeep">
          Done
        </button>
      </div>
    </div>
  );
}
