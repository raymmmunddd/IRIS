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
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

type BpatAssignment = {
  street: string
  caseId: string
  issue: string
  priority: string
}

const quickActions = [
  { label: "Dispatch Board", href: "/bpat-officers/dispatch", icon: Compass },
  { label: "Open Cases", href: "/bpat-officers/cases", icon: ClipboardList },
  { label: "Incident Map", href: "/bpat-officers/map", icon: MapPin },
  { label: "Community Advisories", href: "/bpat-officers/advisories", icon: Megaphone },
];

export default function BpatOfficersPage() {
  const router = useRouter();
  const user = getAuthUser();
  const [assignments, setAssignments] = useState<BpatAssignment[]>([]);
  const [stats, setStats] = useState({ pending: 0, active: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(currentUser.role));
    }
  }, [router]);

  useRealtimeRefresh(async (signal) => {
    const currentUser = getAuthUser();
    if (!currentUser || !isRoleAuthorized(["bpat"])) return;
    try {
      const response = await fetch(`/api/bpat-officers/dashboard?email=${encodeURIComponent(currentUser.email)}`, { signal });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data || !Array.isArray(result.data.assignments)) throw new Error(result.message || "Unable to load field operations data.");
      setStats(result.data.stats);
      setAssignments(result.data.assignments);
      setLoadError("");
    } catch (error) {
      if (!signal.aborted && assignments.length === 0) {
        setLoadError(error instanceof Error ? error.message : "Unable to load field operations data.");
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, { topics: ["iris:cases"], refreshKey: reloadCount, enabled: Boolean(user && isRoleAuthorized(["bpat"])) });

  const handleSignOut = () => {
    logout();
    router.push("/login?role=bpat");
  };

  if (loading) return <div className="flex h-screen overflow-hidden bg-background"><div className="hidden lg:flex h-screen shrink-0"><BpatSidebar /></div><main aria-label="Loading BPAT dashboard" className="flex-1 space-y-4 p-6">{[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}</main></div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <BpatSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
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

       <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Field Operations"
              description="Review dispatch priorities, monitor case activity, and coordinate field response."
              icon={<Compass className="h-5 w-5 text-white" />}
              actionSlot={
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    On Duty
                  </span>
                  <Link
                    href="/bpat-officers/chat"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--iris-border)] bg-white/80 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white"
                  >
                    <Users className="h-4 w-4" />
                    Case Chat
                  </Link>
                </div>
              }
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:max-w-6xl lg:space-y-6">
            {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><span>{loadError}</span><button type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1) }} className="font-semibold underline">Retry</button></div>}
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 lg:space-y-6">
                <section>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Pending */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold tracking-wide text-slate-600">
                            Pending Cases
                          </p>

                          <div className="inline-flex rounded-xl bg-slate-100 px-3 py-1.5 text-lg font-bold text-slate-700">
                            {stats.pending}
                          </div>

                          <p className="text-sm leading-relaxed text-slate-600">
                            Reports waiting for officer review.
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Active */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold tracking-wide text-slate-600">
                            Active Response
                          </p>

                          <div className="inline-flex rounded-xl bg-emerald-100 px-3 py-1.5 text-lg font-bold text-emerald-700">
                            {stats.active}
                          </div>

                          <p className="text-sm leading-relaxed text-slate-600">
                            Incidents currently assigned in the field.
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Urgent */}
                    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold tracking-wide text-slate-600">
                            Urgent Cases
                          </p>

                          <div className="inline-flex rounded-xl bg-red-100 px-3 py-1.5 text-lg font-bold text-red-700">
                            {stats.urgent}
                          </div>

                          <p className="text-sm leading-relaxed text-slate-600">
                            High-priority incidents requiring immediate action.
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Priority Assignments</h3>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-3">
                    {assignments.length === 0 ? <p className="py-5 text-center text-sm text-muted-foreground">No priority assignments right now.</p> : assignments.map((item) => (
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
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4 lg:space-y-6">
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

                <section className="grid gap-3">
                  <Link
                    href="/bpat-officers/chat"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--primary-hover)]"
                  >
                    <Users className="h-4 w-4" />
                    Case Chat
                  </Link>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
