"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, LifeBuoy, Megaphone, Plus } from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { ResidentNav } from "@/components/ResidentNav";

const fallbackRecentUpdates = [
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

const STATUS_COLORS: Record<string, string> = {
  "In progress": "bg-indigo-50 text-indigo-700",
  Scheduled: "bg-purple-50 text-purple-700",
  Closed: "bg-slate-100 text-slate-600",
};

const shortcuts = [
  { label: "Report Incident", icon: Plus, href: "/resident/report-intake" },
  { label: "My Cases", icon: ClipboardList, href: "/resident/cases" },
  { label: "Announcements", icon: Megaphone, href: "/resident/reports" },
  { label: "Help Center", icon: LifeBuoy, href: "/resident/operations" },
];

export default function ResidentPage() {
  const router = useRouter();
  const [recentUpdates, setRecentUpdates] = useState(fallbackRecentUpdates);

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isRoleAuthorized(["resident"])) {
      router.push(getRoleLandingPath(user.role));
      return;
    }

    fetch(`/api/resident/dashboard?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.data?.recentUpdates) {
          setRecentUpdates(result.data.recentUpdates);
        }
      })
      .catch(() => setRecentUpdates(fallbackRecentUpdates));
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
          <NotificationBell />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-24 pt-4">
        {/* Welcome card */}
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

        {/* Shortcuts */}
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

        {/* Recent Updates */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Updates</h3>
            <Link
              href="/resident/cases"
              className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
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
                <p
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    STATUS_COLORS[item.status] ?? "bg-white text-[var(--primary)]"
                  }`}
                >
                  {item.status}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ResidentNav />
    </div>
  );
}
