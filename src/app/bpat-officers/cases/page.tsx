"use client";
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  MapPin,
  Search,
  UserPlus,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { BpatCaseDialog } from "@/components/bpat-case-dialog";
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";

type Priority = "High" | "Medium" | "Low" | "Urgent";
type CaseCategory =
  | "Public Disturbance"
  | "Community Dispute"
  | "Property & Theft"
  | "Violence or Threats"
  | "Harassment & Abuse"
  | "Health"
  | "Other";

interface OpenCase {
  id: string;
  caseNumber: string;
  title: string;
  street: string;
  address: string;
  category: CaseCategory;
  priority: Priority;
  dateSubmitted: string;
  incidentDate: string;
  status: string;
  assignedTo: string | null;
  complainant: string;
  complainantContact: string;
  details: string;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-300",
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PRIORITY_ORDER: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const FILTERS: Array<Priority | "All" | "Unassigned"> = [
  "All",
  "Unassigned",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

export default function OfficerOpenCasesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cases, setCases] = useState<OpenCase[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<OpenCase | null>(null);
  const [page, setPage] = useState(1);

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

    fetch("/api/bpat-officers/cases")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setCases(result.data);
      })
      .catch(() => undefined);
  }, [router]);

  const user = getAuthUser();

  const handleClaim = async (caseId: string, caseNumber: string) => {
    setClaiming(caseId);
    try {
      const response = await fetch("/api/bpat-officers/cases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, email: user?.email }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setCases((prev) => prev.filter((item) => item.id !== caseId));
      setSelectedCase(null);
      toast({
        title: "Case claimed",
        description: `You are now assigned to case #${caseNumber}.`,
      });
    } catch {
      toast({
        title: "Claim failed",
        description: "Unable to assign this case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaiming(null);
    }
  };

  const filtered = cases
    .filter((item) => {
      if (filter === "Unassigned") return !item.assignedTo;
      if (filter === "All") return true;
      return item.priority === filter;
    })
    .filter(
      (item) =>
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.street.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCases = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const unassignedCount = cases.filter((item) => !item.assignedTo).length;

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
                <h1 className="mt-1 text-xl font-bold">Open Cases</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Open Cases"
              description="Review unassigned incidents, claim new cases, and prioritize urgent requests."
              icon={<ClipboardList className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:max-w-6xl lg:space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="order-2 space-y-3 lg:order-1">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">No cases found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagedCases.map((item) => {
                      const isClaiming = claiming === item.id;

                      return (
                        <article
                          key={item.id}
                          onClick={() => setSelectedCase(item)}
                          className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/20 hover:shadow-md"
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
                                {item.street}
                              </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${PRIORITY_STYLES[item.priority]}`}>
                              {item.priority === "Urgent" || item.priority === "High" ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {item.priority}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.dateSubmitted}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                            <span className="text-xs font-medium text-amber-600">Unassigned</span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleClaim(item.id, item.caseNumber);
                              }}
                              disabled={isClaiming}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
                            >
                              {isClaiming ? (
                                <span className="animate-pulse">Claiming...</span>
                              ) : (
                                <>
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Take Case
                                </>
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
                {filtered.length > pageSize && (
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={currentPage <= 1}
                        className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                        disabled={currentPage >= totalPages}
                        className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <aside className="order-1 space-y-4 lg:order-2">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total Open", value: cases.length, color: "text-[var(--primary)]", bg: "bg-[var(--primary-light)]" },
                    { label: "Unassigned", value: unassignedCount, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Urgent", value: cases.filter((item) => item.priority === "Urgent").length, color: "text-red-600", bg: "bg-red-50" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl ${item.bg} border border-border px-2 py-3 text-center`}>
                      <p className={`text-xl font-extrabold ${item.color}`}>{item.value}</p>
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Search Cases</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by title, ID, or street..."
                      className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter Priority</p>
                  <div className="flex flex-wrap gap-2">
                    {FILTERS.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setFilter(item);
                          setPage(1);
                        }}
                        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          filter === item
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/40"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
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
