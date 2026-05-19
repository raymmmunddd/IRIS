"use client";
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import Link from "next/link";
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Search,
} from "lucide-react";

type Tag = "Advisory" | "Health" | "Public Safety" | "Events" | "General" | "Infrastructure" | "BPAT";

const TAG_STYLES: Record<Tag, string> = {
  Advisory: "bg-amber-50 text-amber-700 border-amber-200",
  Health: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Public Safety": "bg-red-50 text-red-700 border-red-200",
  Events: "bg-blue-50 text-blue-700 border-blue-200",
  General: "bg-slate-100 text-slate-600 border-slate-200",
  Infrastructure: "bg-purple-50 text-purple-700 border-purple-200",
  BPAT: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

interface Advisory {
  id: number | string;
  title: string;
  content: string;
  date: string;
  tag: Tag;
  author: string;
  pinned?: boolean;
  forOfficers?: boolean;
}

const ADVISORIES: Advisory[] = [
  {
    id: 1,
    title: "BPAT Briefing — High-Risk Cases This Week",
    content:
      "All BPAT officers are reminded that cases IR-251 (violence) and IR-247 (stray dog attacks) have been flagged as high risk. Officers assigned must coordinate with the Barangay Captain before field visit. Bring incident documentation forms. Wear complete field gear.",
    date: "May 5, 2026",
    tag: "BPAT",
    author: "Barangay Captain",
    pinned: true,
    forOfficers: true,
  },
  {
    id: 2,
    title: "Barangay Assembly — May 15, 2026",
    content:
      "All officers and residents are invited to the quarterly Barangay Assembly on May 15, 2026 at 9:00 AM at the Barangay Hall. Attendance is mandatory for all BPAT members. Submit attendance confirmation to the Barangay Secretary by May 12.",
    date: "May 5, 2026",
    tag: "Events",
    author: "Barangay Secretary",
    pinned: true,
  },
  {
    id: 3,
    title: "Scheduled Water Interruption — May 8",
    content:
      "Maynilad will conduct pipe maintenance on May 8, 2026 from 8:00 AM to 5:00 PM affecting Bonifacio Street and Sampaguita Street. Officers patrolling these areas should be aware of potential crowd control needs during peak interruption hours.",
    date: "May 4, 2026",
    tag: "Advisory",
    author: "Barangay Captain",
  },
  {
    id: 4,
    title: "Free Medical Mission — May 10",
    content:
      "The Barangay Health Center will hold a free medical mission on May 10, 2026, 7:00 AM – 12:00 NN at the Barangay Covered Court. Two BPAT officers are requested to assist in crowd management during the event.",
    date: "May 3, 2026",
    tag: "Health",
    author: "Barangay Health Worker",
  },
  {
    id: 5,
    title: "Anti-Illegal Drugs Drive — Ongoing",
    content:
      "In cooperation with the PNP, intensified anti-illegal drugs operations are ongoing. BPAT officers should report suspicious activities immediately via the case system. All tips must be documented with case numbers.",
    date: "Apr 30, 2026",
    tag: "Public Safety",
    author: "Barangay Captain",
  },
  {
    id: 6,
    title: "Road Clearing Operations",
    content:
      "Road clearing along Rizal Avenue and Del Pilar Street begins May 6, 2026. Officers assigned to those streets should facilitate orderly removal of obstructions and document violators.",
    date: "Apr 28, 2026",
    tag: "Infrastructure",
    author: "Barangay Engineer",
  },
];

const ALL_TAGS: Array<Tag | "All"> = ["All", "BPAT", "Advisory", "Health", "Public Safety", "Events", "General", "Infrastructure"];

function AdvisoryCard({ item }: { item: Advisory }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.content.length > 120;

  return (
    <article
      className={`rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md ${
        item.pinned ? "border-[var(--primary)]/30 ring-1 ring-[var(--primary)]/10" : "border-border"
      }`}
    >
      {item.pinned && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
          📌 Pinned
        </div>
      )}
      {item.forOfficers && (
        <div className="mb-2 ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
          Officers Only
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TAG_STYLES[item.tag]}`}>
              {item.tag}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {item.date}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isLong && !expanded ? `${item.content.slice(0, 120)}...` : item.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Read more</>}
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">Posted by: {item.author}</p>
    </article>
  );
}

export default function OfficerAdvisoriesPage() {
  const [tag, setTag] = useState<Tag | "All">("All");
  const [search, setSearch] = useState("");
  const [advisories, setAdvisories] = useState<Advisory[]>(ADVISORIES);

  useEffect(() => {
    fetch("/api/bpat-officers/advisories")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setAdvisories(result.data.length ? result.data : ADVISORIES);
      })
      .catch(() => undefined);
  }, []);

  const filtered = advisories.filter((a) => {
    const matchTag = tag === "All" || a.tag === tag;
    const matchSearch =
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const rest = filtered.filter((a) => !a.pinned);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <BpatSidebar />
      </div>

      <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/bpat-officers"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Field Ops
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">BPAT Mobile Desk</p>
                <h1 className="mt-1 text-xl font-bold">Community Advisories</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Community Advisories"
              description="Broadcast updates and track pinned notices for BPAT and residents."
              icon={<Megaphone className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4 lg:max-w-6xl lg:space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="order-2 space-y-4 lg:order-1">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">No advisories found</p>
                  </div>
                ) : (
                  <>
                    {pinned.length > 0 && (
                      <div className="space-y-3">
                        {pinned.map((a) => (
                          <AdvisoryCard key={a.id} item={a} />
                        ))}
                      </div>
                    )}
                    {rest.length > 0 && (
                      <div className="space-y-3">
                        {pinned.length > 0 && (
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">All Advisories</p>
                        )}
                        {rest.map((a) => (
                          <AdvisoryCard key={a.id} item={a} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>

              <aside className="order-1 space-y-4 lg:order-2">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Search Advisories</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search advisories..."
                      className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          tag === t
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
