"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  Shield,
  User,
} from "lucide-react";
import { ResidentSidebar } from "@/components/resident/sidebar";
import { ResidentNav } from "@/components/ResidentNav";
import { getAuthUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";

type CaseStatus = "Pending" | "Under Review" | "Scheduled" | "In Progress" | "Resolved" | "Closed" | "Dismissed";

interface ResidentCase {
  id: string;
  title: string;
  category: string;
  status: CaseStatus;
  lastUpdate: string;
  submittedOn: string;
  detail: string;
  dbId?: string;
  assignedOfficer?: string | null;
  canChat?: boolean;
}

interface ChatMessage {
  id: string;
  from: "officer" | "complainant";
  text: string;
  time: string;
}

interface ChatThread {
  caseId: string;
  caseNumber: string;
  title: string;
  officer: string;
  status: string;
  messages: ChatMessage[];
}

const STATUS_STYLES: Record<CaseStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-100 text-slate-600 border-slate-200",
  Dismissed: "bg-red-50 text-red-700 border-red-200",
};

const FALLBACK_CASES: ResidentCase[] = [
  {
    id: "IR-219",
    title: "Noise complaint",
    category: "Public Disturbance",
    status: "In Progress",
    lastUpdate: "2h ago",
    submittedOn: "Apr 28, 2026",
    detail: "Assigned to BPAT Team 2",
  },
  {
    id: "IR-202",
    title: "Streetlight outage",
    category: "Community Dispute",
    status: "Scheduled",
    lastUpdate: "Yesterday",
    submittedOn: "Apr 25, 2026",
    detail: "Marked for barangay utility visit",
  },
  {
    id: "IR-180",
    title: "Public disturbance",
    category: "Public Disturbance",
    status: "Resolved",
    lastUpdate: "3 days ago",
    submittedOn: "Apr 12, 2026",
    detail: "Resolved with mediation",
  },
  {
    id: "IR-155",
    title: "Property boundary dispute",
    category: "Community Dispute",
    status: "Closed",
    lastUpdate: "2 weeks ago",
    submittedOn: "Mar 30, 2026",
    detail: "Kasunduan signed by both parties",
  },
];

const FILTERS: Array<CaseStatus | "All"> = [
  "All",
  "Pending",
  "In Progress",
  "Scheduled",
  "Resolved",
  "Closed",
];

export default function MyCasesPage() {
  const [filter, setFilter] = useState<CaseStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<ResidentCase[]>(FALLBACK_CASES);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) return;

    fetch(`/api/resident/cases?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setCases(result.data);
        }
      })
      .catch(() => setCases(FALLBACK_CASES));
  }, []);

  useEffect(() => {
    if (!activeThread) return;
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [activeThread]);

  const filtered = cases.filter((c) => {
    const matchesFilter = filter === "All" || c.status === filter;
    const matchesSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openChat = async (caseItem: ResidentCase) => {
    const user = getAuthUser();
    if (!user || !caseItem.dbId || !caseItem.canChat) {
      setChatError("Chat opens after the case is assigned to an officer.");
      return;
    }

    setChatError("");
    const response = await fetch(`/api/resident/cases/chat?caseId=${encodeURIComponent(caseItem.dbId)}&email=${encodeURIComponent(user.email)}`);
    const result = await response.json();
    if (result.success && result.data) {
      setActiveThread(result.data);
    } else {
      setChatError(result.message ?? "Unable to open chat for this case.");
    }
  };

  const sendMessage = async () => {
    const user = getAuthUser();
    if (!user || !activeThread || !chatInput.trim()) return;

    const response = await fetch("/api/resident/cases/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: activeThread.caseId,
        email: user.email,
        message: chatInput.trim(),
      }),
    });
    const result = await response.json();
    if (result.success && result.data) {
      setActiveThread(result.data);
      setChatInput("");
    }
  };

  const handleChatKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (activeThread) {
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <div className="hidden lg:flex h-screen shrink-0">
          <ResidentSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-hidden p-0 sm:p-0 lg:p-8">
            <div className="hidden lg:block px-4 sm:px-6 lg:px-0">
              <PageHeader
                title="Case Chat"
                description={`Conversation with ${activeThread.officer} for case #${activeThread.caseNumber}.`}
                icon={<MessageSquare className="h-5 w-5 text-white" />}
                actionSlot={
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    {activeThread.status}
                  </span>
                }
              />
            </div>

            <div className="mx-auto flex h-full w-full max-w-md flex-col lg:max-w-5xl lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-sm">
              <header className="flex-shrink-0 border-b border-border bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[#123472] px-4 pb-4 pt-4 text-white shadow-sm lg:rounded-t-2xl">
                <div className="mx-auto w-full max-w-md">
                  <button
                    onClick={() => setActiveThread(null)}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/70 transition-colors hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    My Cases
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{activeThread.officer}</p>
                      <p className="truncate text-xs text-white/70">#{activeThread.caseNumber}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                      {activeThread.status}
                    </span>
                  </div>
                </div>
              </header>

              <div className="flex-shrink-0 border-b border-border bg-muted/40 px-4 py-2">
                <div className="mx-auto w-full max-w-md">
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Case:</span> {activeThread.title}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mx-auto w-full max-w-md space-y-3">
                  {activeThread.messages.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-xs text-muted-foreground">
                      No messages yet.
                    </div>
                  )}
                  {activeThread.messages.map((message) => {
                    const isResident = message.from === "complainant";
                    return (
                      <div key={message.id} className={`flex gap-2 ${isResident ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isResident ? "bg-[var(--primary)]" : "bg-muted"}`}>
                          {isResident ? <User className="h-4 w-4 text-white" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className={`flex max-w-[75%] flex-col gap-1 ${isResident ? "items-end" : "items-start"}`}>
                          <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isResident ? "rounded-tr-sm bg-[var(--primary)] text-white" : "rounded-tl-sm border border-border bg-card text-foreground"}`}>
                            {message.text}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{message.time}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
                <div className="mx-auto flex w-full max-w-md items-center gap-2">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={handleChatKey}
                    placeholder={`Message ${activeThread.officer}...`}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <ResidentSidebar />
      </div>

      <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
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
                <h1 className="mt-1 text-xl font-bold">My Cases</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="My Cases"
              description="Track case progress, view officer updates, and open conversations once assigned."
              icon={<ClipboardList className="h-5 w-5 text-white" />}
              actionSlot={
                <div className="flex items-center gap-2">
                  <Link
                    href="/resident/report-intake"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--iris-border)] bg-white/80 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white"
                  >
                    <Plus className="h-4 w-4" />
                    Report incident
                  </Link>
                  <Link
                    href="/resident/updates"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--iris-border)] bg-white/80 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white"
                  >
                    View updates
                  </Link>
                </div>
              }
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 pb-24 lg:max-w-6xl lg:space-y-6 lg:pb-0">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-4 lg:space-y-6">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by case ID or title..."
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:pb-0">
                      {FILTERS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            filter === f
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/40"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {chatError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                    {chatError}
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">No cases found</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filter or search.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((c) => (
                      <article
                        key={c.id}
                        onClick={() => openChat(c)}
                        className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/30 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[var(--primary)]">#{c.id}</span>
                              <span className="text-xs text-muted-foreground">{c.category}</span>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[c.status]}`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-foreground">{c.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {c.lastUpdate}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClipboardList className="h-3 w-3" />
                                {c.submittedOn}
                              </span>
                              {c.assignedOfficer && (
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {c.assignedOfficer}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                        </div>

                        {c.canChat && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]">
                            <MessageSquare className="h-3 w-3" />
                            Chat with officer
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <aside className="space-y-4 lg:space-y-6">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Case Summary</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-1">
                    {[
                      { label: "Total", value: cases.length, color: "text-[var(--primary)]" },
                      {
                        label: "Active",
                        value: cases.filter((c) =>
                          ["Pending", "Under Review", "In Progress", "Scheduled"].includes(c.status)
                        ).length,
                        color: "text-amber-600",
                      },
                      {
                        label: "Resolved",
                        value: cases.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
                        color: "text-emerald-600",
                      },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-border bg-background p-3 text-center">
                        <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/resident/report-intake"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 py-4 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10"
                >
                  <Plus className="h-4 w-4" />
                  File a new report
                </Link>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resident Guidance</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Case chats open after an officer assignment. Check the status tag to confirm next steps
                    and visit the Help Center for hearing timelines.
                  </p>
                  <Link
                    href="/resident/operations"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Visit Help Center
                  </Link>
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
