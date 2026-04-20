"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CircleCheck,
  ClipboardList,
  FileText,
  Home,
  LifeBuoy,
  Megaphone,
  Plus,
  User,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";

const recentUpdates = [
  {
    title: "Noise complaint #IR-219",
    detail: "Assigned to BPAT Team 2",
    status: "In progress",
    when: "2h ago",
  },
  {
    title: "Streetlight outage #IR-202",
    detail: "Marked for barangay utility visit",
    status: "Scheduled",
    when: "Yesterday",
  },
  {
    title: "Public disturbance #IR-180",
    detail: "Resolved with mediation",
    status: "Closed",
    when: "3 days ago",
  },
];

const shortcuts = [
  { label: "Report Incident", icon: Plus, href: "/resident/report-intake" },
  { label: "My Cases", icon: ClipboardList, href: "/cases" },
  { label: "Announcements", icon: Megaphone, href: "/reports" },
  { label: "Help Center", icon: LifeBuoy, href: "/operations" },
];

export default function ResidentPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isRoleAuthorized(["resident"])) {
      router.push(getRoleLandingPath(user.role));
    }
  }, [router]);

  const user = getAuthUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[#123472] px-4 pb-5 pt-4 text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">IRIS Resident</p>
            <h1 className="mt-1 text-xl font-bold">Community Mobile Portal</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Bell className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-24 pt-4">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Welcome</p>
              <h2 className="text-lg font-semibold">{user?.email ?? "Resident User"}</h2>
            </div>
            <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              Resident
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            File reports fast, view case movement, and receive verified barangay advisories.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <Link
                key={shortcut.label}
                href={shortcut.href}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/40 hover:shadow"
              >
                <Icon className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-2 text-sm font-semibold text-foreground">{shortcut.label}</p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Updates</h3>
            <Link href="/cases" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentUpdates.map((item) => (
              <article key={item.title} className="rounded-xl bg-[var(--muted)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.when}</span>
                </div>
                <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
                  {item.status}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 px-2 py-2">
          <Link href="/resident" className="flex flex-col items-center gap-1 rounded-lg py-2 text-[var(--primary)]">
            <Home className="h-5 w-5" />
            <span className="text-[11px] font-semibold">Home</span>
          </Link>
          <Link href="/cases" className="flex flex-col items-center gap-1 rounded-lg py-2 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <span className="text-[11px]">Cases</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 rounded-lg py-2 text-muted-foreground">
            <CircleCheck className="h-5 w-5" />
            <span className="text-[11px]">Updates</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 rounded-lg py-2 text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-[11px]">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
