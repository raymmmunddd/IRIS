"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, Home, Plus, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/resident", icon: Home },
  { label: "Report", href: "/resident/report-intake", icon: Plus },
  { label: "Cases", href: "/resident/cases", icon: ClipboardList },
  { label: "Updates", href: "/resident/updates", icon: Bell },
  { label: "Account", href: "/resident/account", icon: User },
];

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Resident navigation" className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 px-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === "/resident" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition-colors ${
                active ? "text-[var(--primary)]" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={`text-[10px] leading-none ${active ? "font-semibold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
