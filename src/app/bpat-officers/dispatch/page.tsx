"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { BpatCaseDialog } from "@/components/bpat-case-dialog";
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";

type Priority = "High" | "Medium" | "Low";
type CaseStatus = "Assigned" | "In Progress" | "Pending Review";

interface AssignedCase {
  id: string;
  caseNumber: string;
  title: string;
  street: string;
  address: string;
  category: string;
  priority: Priority;
  status: CaseStatus;
  scheduledDate: string;
  eta: string;
  complainant: string;
  complainantContact: string;
  dateSubmitted: string;
  incidentDate: string;
  details: string;
  assignedTo?: string | null;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_STYLES: Record<CaseStatus, string> = {
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  "Pending Review": "bg-purple-50 text-purple-700",
};

function PriorityIcon({ priority }: { priority: Priority }) {
  if (priority === "High") return <AlertTriangle className="h-3.5 w-3.5 text-red-600" />;
  if (priority === "Medium") return <Clock className="h-3.5 w-3.5 text-amber-600" />;
  return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
}

export default function DispatchBoardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CaseStatus | "All">("All");
  const [assignedCases, setAssignedCases] = useState<AssignedCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<AssignedCase | null>(null);

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

    fetch(`/api/bpat-officers/dispatch?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setAssignedCases(result.data);
      })
      .catch(() => undefined);
  }, [router]);

  const filtered = filter === "All" ? assignedCases : assignedCases.filter((item) => item.status === filter);

  const statusCounts = {
    All: assignedCases.length,
    Assigned: assignedCases.filter((item) => item.status === "Assigned").length,
    "In Progress": assignedCases.filter((item) => item.status === "In Progress").length,
    "Pending Review": assignedCases.filter((item) => item.status === "Pending Review").length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <BpatSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/bpat-officers"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-foreground)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Field Ops
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">BPAT Mobile Desk</p>
                <h1 className="mt-1 text-xl font-bold">Dispatch Board</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Compass className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Dispatch Board"
              description="Manage assigned field cases, review priorities, and track scheduled responses."
              icon={<Compass className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:max-w-6xl lg:space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="order-2 space-y-3 lg:order-1">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <Compass className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">No assigned cases found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => setSelectedCase(item)}
                        className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/30 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[var(--primary)]">#{item.caseNumber}</span>
                              <span className="text-xs text-muted-foreground">{item.category}</span>
                            </div>
                            <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{item.title}</h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {item.street} · {item.address}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_STYLES[item.priority]}`}>
                            <PriorityIcon priority={item.priority} />
                            {item.priority}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>
                            {item.status}
                          </span>
                          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {item.scheduledDate}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <p className="text-xs text-muted-foreground">
                            Complainant: <span className="font-medium text-foreground">{item.complainant}</span>
                          </p>
                          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                            <Clock className="h-3 w-3" />
                            ETA {item.eta}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <aside className="order-1 space-y-4 lg:order-2">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Assigned", count: statusCounts.Assigned, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "In Progress", count: statusCounts["In Progress"], color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Review", count: statusCounts["Pending Review"], color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl ${item.bg} border border-border px-2 py-3 text-center`}>
                      <p className={`text-xl font-extrabold ${item.color}`}>{item.count}</p>
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["All", "Assigned", "In Progress", "Pending Review"] as const).map((item) => (
                      <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          filter === item
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/40"
                        }`}
                      >
                        {item} {item === "All" ? `(${statusCounts.All})` : `(${statusCounts[item]})`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
                  Tap a case card to review details and confirm field coordination updates.
                </div>
              </aside>
            </div>
          </div>
        </main>

        <BpatCaseDialog
          open={!!selectedCase}
          onOpenChange={(open) => !open && setSelectedCase(null)}
          selectedCase={selectedCase}
        />
      </div>
    </div>
  );
}
