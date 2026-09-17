export function Field({ label, children, span }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-medium text-inkSoft">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-md border border-border px-3 py-2 text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 transition-colors";

export function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}

export function Select(props) {
  return <select {...props} className={`${inputCls} ${props.className || ""}`} />;
}

export function Badge({ status }) {
  const map = {
    Paid: "bg-green/10 text-green",
    Partial: "bg-amber/10 text-amber",
    Unpaid: "bg-rose/10 text-rose",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || map.Unpaid}`}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, tint }) {
  return (
    <div className="rounded-lg bg-white p-4 flex items-start justify-between border border-border">
      <div>
        <div className="text-[13px] text-inkSoft">{label}</div>
        <div className="mt-1 text-2xl font-head text-ink tabular-nums">{value}</div>
      </div>
      <div className="rounded-md p-2" style={{ background: tint || "#E4ECE6" }}>
        <Icon size={18} className="text-tealDeep" />
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
      <div>
        <h2 className="text-xl font-head text-ink">{title}</h2>
        {subtitle && <p className="text-sm mt-0.5 text-inkSoft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-head text-ink">{title}</h3>
          <button onClick={onClose} className="text-inkSoft hover:text-ink rounded p-1">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-head text-ink">{title}</h3>
          <p className="text-sm text-inkSoft mt-2">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm text-inkSoft bg-surfaceAlt hover:bg-surfaceAlt/80">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md px-4 py-2 text-sm text-white bg-rose hover:bg-rose/90 disabled:opacity-50"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
