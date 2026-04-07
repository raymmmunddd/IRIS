"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Compass,
  MapPin,
  Megaphone,
  Phone,
  ShieldCheck,
  Timer,
  Users,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";

const assignments = [
  {
    purok: "Purok 3",
    caseId: "IR-244",
    issue: "Night disturbance",
    priority: "High",
    eta: "15 mins",
  },
  {
    purok: "Purok 5",
    caseId: "IR-238",
    issue: "Mediation follow-up",
    priority: "Medium",
    eta: "35 mins",
  },
  {
    purok: "Purok 1",
    caseId: "IR-231",
    issue: "Vandalism report",
    priority: "Low",
    eta: "45 mins",
  },
];

const quickActions = [
  { label: "Dispatch Board", href: "/operations", icon: Compass },
  { label: "Open Cases", href: "/cases", icon: ClipboardList },
  { label: "Incident Map", href: "/reports", icon: MapPin },
  { label: "Community Advisories", href: "/admin", icon: Megaphone },
];

export default function BpatOfficersPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(user.role));
    }
  }, [router]);

  const user = getAuthUser();

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
          <p className="mt-3 text-sm text-[var(--sidebar-muted)]">{user?.email ?? "BPAT Officer"}</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 pb-8 pt-4">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[var(--primary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-xl font-bold text-[var(--primary)]">6</p>
            </div>
            <div className="rounded-xl bg-[var(--secondary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="mt-1 text-xl font-bold text-[var(--secondary-hover)]">3</p>
            </div>
            <div className="rounded-xl bg-[var(--tertiary-light)] px-2 py-3">
              <p className="text-xs text-muted-foreground">Urgent</p>
              <p className="mt-1 text-xl font-bold text-[var(--tertiary)]">1</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.purok}</p>
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

        <section className="grid grid-cols-2 gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)]">
            <Users className="h-4 w-4" />
            Team Chat
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-[var(--muted)]">
            <Phone className="h-4 w-4" />
            Quick Call
          </button>
        </section>
      </main>
    </div>
  );
}
