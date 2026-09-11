"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Activity, Receipt, FileText, BarChart3, Stethoscope,
} from "lucide-react";
import { useMode } from "./ModeContext";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/xrays", label: "X-Ray records", icon: Activity },
  { href: "/billing", label: "New bill", icon: Receipt },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3, advanced: true },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const { isAdvanced, setIsAdvanced } = useMode();
  const items = NAV.filter((n) => !n.advanced || isAdvanced);

  return (
    <div className="flex flex-col sm:flex-row min-h-screen w-full">
      {/* Desktop / tablet vertical rail */}
      <div className="hidden sm:flex flex-col w-56 shrink-0 py-5 px-3 bg-tealDeep">
        <div className="flex items-center gap-2 px-2 mb-6">
          <Stethoscope size={20} className="text-white" />
          <span className="text-white text-[15px] font-head">Riverside Clinic</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/[.14] text-white" : "text-white/60 hover:text-white/90"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile horizontal tab bar */}
      <div className="sm:hidden flex overflow-x-auto gap-1 px-2 py-2 bg-tealDeep no-scrollbar">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap shrink-0 ${
                active ? "bg-white/[.16] text-white" : "text-white/60"
              }`}
            >
              <Icon size={13} /> {label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border">
          <p className="text-xs text-inkSoft">Billing software</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={isAdvanced ? "text-inkSoft" : "text-ink"}>Basic</span>
            <button
              onClick={() => setIsAdvanced(!isAdvanced)}
              aria-label="Toggle advanced mode"
              className="relative rounded-full transition-colors"
              style={{ width: 40, height: 22, background: isAdvanced ? "#1F6F63" : "#CBD8CF" }}
            >
              <span
                className="absolute top-0.5 left-0.5 rounded-full bg-white transition-transform"
                style={{ width: 18, height: 18, transform: isAdvanced ? "translateX(18px)" : "translateX(0)" }}
              />
            </button>
            <span className={isAdvanced ? "text-ink" : "text-inkSoft"}>Advanced</span>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-1 bg-page">{children}</div>
      </div>
    </div>
  );
}
