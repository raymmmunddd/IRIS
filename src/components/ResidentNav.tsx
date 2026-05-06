"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ClipboardList, Home, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/resident", icon: Home },
  { label: "Cases", href: "/resident/cases", icon: ClipboardList },
  { label: "Updates", href: "/resident/updates", icon: Bell },
  { label: "Account", href: "/resident/account", icon: User },
];

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4 px-2 py-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
                active ? "text-[var(--primary)]" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-[11px] ${active ? "font-semibold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}