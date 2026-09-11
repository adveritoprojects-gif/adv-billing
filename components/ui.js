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
