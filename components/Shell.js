"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  Receipt,
  FileText,
  BarChart3,
  Stethoscope,
} from "lucide-react";
import Image from "next/image";
const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/xrays", label: "X-Ray Records", icon: Activity },
  { href: "/billing", label: "New Bill", icon: Receipt },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];
export default function Shell({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col sm:flex-row min-h-screen w-full">
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 shrink-0 py-5 px-3 bg-tealDeep">
        {/* Clinic Header */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <Image src="/icon.png" alt="Logo" width={32} height={32} />
          <p className="text-xl font-head text-white"> Adv Billings</p>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-white/[.14] text-white" : "text-white/60 hover:text-white/90"}`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      {/* Mobile Navigation */}
      <nav
        className="sm:hidden flex overflow-x-auto gap-1 px-2 py-2 bg-tealDeep no-scrollbar"
        aria-label="Mobile navigation"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap shrink-0 transition-colors ${active ? "bg-white/[.16] text-white" : "text-white/60 hover:text-white/90"}`}
            >
              <Icon size={13} className="shrink-0" /> <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="no-print flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border">
          <p className="text-xs text-inkSoft"> Payyanur Scan </p>
        </header>
        {/* Page Content */}
        <div className="p-4 sm:p-6 flex-1 bg-page"> {children} </div>
      </main>
    </div>
  );
}
