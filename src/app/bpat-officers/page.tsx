"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Compass,
  MapPin,
  Megaphone,
  LogOut,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized, logout } from "@/lib/auth";

const fallbackAssignments = [
  {
    street: "Mabini Street",
    caseId: "IR-244",
    issue: "Night disturbance",
    priority: "High",
    eta: "15 mins",
  },
  {
    street: "Sampaguita Street",
    caseId: "IR-238",
    issue: "Mediation follow-up",
    priority: "Medium",
    eta: "35 mins",
  },
  {
    street: "Rizal Avenue",
    caseId: "IR-231",
    issue: "Vandalism report",
    priority: "Low",
    eta: "45 mins",
  },
];

const quickActions = [
  { label: "Dispatch Board", href: "/bpat-officers/dispatch", icon: Compass },
  { label: "Open Cases", href: "/bpat-officers/cases", icon: ClipboardList },
  { label: "Incident Map", href: "/bpat-officers/map", icon: MapPin },
  { label: "Community Advisories", href: "/bpat-officers/advisories", icon: Megaphone },
];

export default function BpatOfficersPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState(fallbackAssignments);
  const [stats, setStats] = useState({ pending: 6, active: 3, urgent: 1 });

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(user.role));
      return;
    }

    fetch(`/api/bpat-officers/dashboard?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.data) {
          setStats(result.data.stats);
          setAssignments(result.data.assignments.length ? result.data.assignments : fallbackAssignments);
        }
      })
      .catch(() => undefined);
  }, [router]);

  const user = getAuthUser();

  const handleSignOut = () => {
    logout();
    router.push("/login?role=bpat");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">BPAT Mobile Desk</p>
              <h1 className="mt-1 text-xl font-bold">Field Operations</h1>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-semibold text-[#1f2937]">
              <ShieldCheck className="h-3.5 w-3.5" />
              On Duty
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-[var(--sidebar-muted)]">{user?.email ?? "BPAT Officer"}</p>
            <button
              onClick={handleSignOut}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-8 pt-4">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[var(--primary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-xl font-bold text-[var(--primary)]">{stats.pending}</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="mt-1 text-xl font-bold text-[var(--secondary-hover)]">{stats.active}</p>
            </div>
            <div className="rounded-xl bg-[var(--tertiary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Urgent</p>
              <p className="mt-1 text-xl font-bold text-[var(--tertiary)]">{stats.urgent}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/40 hover:shadow"
              >
                <Icon className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-2 text-sm font-semibold">{action.label}</p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Priority Assignments</h3>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {assignments.map((item) => (
              <article key={item.caseId} className="rounded-xl bg-[var(--muted)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.street}</p>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--primary)]">
                    {item.caseId}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-semibold">{item.issue}</h4>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {item.priority} Priority
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">ETA {item.eta}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <Link
            href="/bpat-officers/chat"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)]"
          >
            <Users className="h-4 w-4" />
            Case Chat
          </Link>
        </section>
      </main>
    </div>
  );
}
