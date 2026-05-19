export const dynamic = 'force-dynamic'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Briefcase, CheckCircle2, Clock, FileText, Settings } from "lucide-react";
import { ResidentNav } from "@/components/ResidentNav";
import { ResidentSidebar } from "@/components/resident/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { type ResidentNotif, loadNotifs, saveNotifs } from "@/components/NotificationBell";
import { getAuthUser } from "@/lib/auth";

const CATEGORY_ICON = {
  case: Briefcase,
  report: FileText,
  system: Settings,
};

function getCategoryIcon(category: string) {
  const Icon = CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] ?? Bell;
  return Icon;
}

export default function UpdatesPage() {
  const [notifs, setNotifs] = useState<ResidentNotif[]>(loadNotifs);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      return;
    }

    fetch(`/api/resident/notifications?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        setNotifs(result.success ? result.data : loadNotifs());
      })
      .catch(() => setNotifs(loadNotifs()));
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const allRead = unread === 0;

  const markOne = (id: number | string) => {
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifs(updated);
    saveNotifs(updated);
    const user = getAuthUser();
    if (user) {
      fetch(`/api/resident/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      }).catch(() => undefined);
    }
  };

  const markAll = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifs(updated);
    const user = getAuthUser();
    if (user) {
      fetch("/api/resident/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      }).catch(() => undefined);
    }
  };

  const recent = notifs.slice(0, 3);
  const older = notifs.slice(3);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <ResidentSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[#123472] px-4 pb-5 pt-4 text-white shadow-sm lg:hidden">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/resident"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">IRIS Resident</p>
                <h1 className="mt-1 text-xl font-bold">Updates</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Bell className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Updates"
              description="Stay on top of case updates, announcements, and system notifications."
              icon={<Bell className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 pb-24 lg:max-w-6xl lg:space-y-6 lg:pb-0">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="order-2 space-y-4 lg:order-1 lg:space-y-6">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Recent
                  </p>
                  <div className="space-y-2">
                    {recent.map((n) => {
                      const Icon = getCategoryIcon(n.category ?? "case");
                      return (
                        <button
                          key={n.id}
                          onClick={() => markOne(n.id)}
                          className={`w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md ${
                            !n.read
                              ? "border-[var(--primary)]/20 bg-[var(--primary)]/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                              <Icon className="h-4 w-4 text-[var(--primary)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground leading-snug">
                                  {n.title}
                                </p>
                                {!n.read ? (
                                  <span className="flex-shrink-0 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                                    New
                                  </span>
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                                {n.message}
                              </p>
                              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {older.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Earlier
                    </p>
                    <div className="space-y-2">
                      {older.map((n) => {
                        const Icon = getCategoryIcon(n.category ?? "system");
                        return (
                          <button
                            key={n.id}
                            onClick={() => markOne(n.id)}
                            className={`w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:shadow-md ${
                              !n.read ? "border-[var(--primary)]/20" : "border-border"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {n.time}
                                </p>
                              </div>
                              {!n.read && (
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {notifs.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </div>

              <aside className="order-1 space-y-4 lg:order-2 lg:space-y-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                      <Bell className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up"}
                      </p>
                      <p className="text-xs text-muted-foreground">Tap a notification to mark it read</p>
                    </div>
                  </div>
                  <button
                    onClick={markAll}
                    disabled={allRead}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:bg-muted disabled:opacity-40"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notification Types</p>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {[
                      { label: "Case updates", icon: Briefcase, detail: "Hearing schedules and officer actions." },
                      { label: "Reports", icon: FileText, detail: "Submitted reports and barangay advisories." },
                      { label: "System", icon: Settings, detail: "Account and portal notices." },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        <div className="lg:hidden">
          <ResidentNav />
        </div>
      </div>
    </div>
  );
}
