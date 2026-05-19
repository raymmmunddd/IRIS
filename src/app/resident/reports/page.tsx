export const dynamic = 'force-dynamic'
  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Megaphone, Search } from "lucide-react";
  import { ResidentNav } from "@/components/ResidentNav";
  import { ResidentSidebar } from "@/components/resident/sidebar";
  import { PageHeader } from "@/components/ui/page-header";

  interface Announcement {
    id: number | string;
    title: string;
    content: string;
    date: string;
    tag: string;
    tagColor?: string;
    author: string;
    pinned?: boolean;
  }

  const TAG_COLORS: Record<string, string> = {
    Advisory: "bg-amber-50 text-amber-700 border-amber-200",
    Health: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Public Safety": "bg-red-50 text-red-700 border-red-200",
    Events: "bg-blue-50 text-blue-700 border-blue-200",
    General: "bg-slate-100 text-slate-600 border-slate-200",
    Infrastructure: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const ANNOUNCEMENTS: Announcement[] = [
    {
      id: 1,
      title: "Barangay Assembly — May 15, 2026",
      content:
        "All residents are invited to the quarterly Barangay Assembly on May 15, 2026 at 9:00 AM, Barangay Hall, East Tapinac. Discuss community concerns, budget updates, and upcoming projects. Attendance is encouraged. Please bring a valid ID.",
      date: "May 5, 2026",
      tag: "Events",
      tagColor: TAG_COLORS["Events"],
      author: "Barangay Secretary",
      pinned: true,
    },
    {
      id: 2,
      title: "Scheduled Water Interruption — May 8",
      content:
        "Maynilad will conduct pipe maintenance on May 8, 2026 from 8:00 AM to 5:00 PM affecting Bonifacio Street and Sampaguita Street. Please store adequate water beforehand. For concerns, contact the Barangay Hall at 047-222-XXXX.",
      date: "May 4, 2026",
      tag: "Advisory",
      tagColor: TAG_COLORS["Advisory"],
      author: "Barangay Captain",
    },
    {
      id: 3,
      title: "Free Medical Mission — May 10",
      content:
        "The Barangay Health Center in coordination with OLMC Hospital will hold a free medical mission on May 10, 2026, 7:00 AM – 12:00 NN at the Barangay Covered Court. Services: BP monitoring, blood sugar testing, dental check-up, and free medicines. Bring your Barangay ID.",
      date: "May 3, 2026",
      tag: "Health",
      tagColor: TAG_COLORS["Health"],
      author: "Barangay Health Worker",
    },
    {
      id: 4,
      title: "Anti-Illegal Drugs Drive — Ongoing",
      content:
        "In cooperation with the PNP, the barangay is conducting intensified anti-illegal drugs operations. Residents are encouraged to report suspicious activities to the Barangay Tanod or call the hotline. All reports are kept confidential.",
      date: "Apr 30, 2026",
      tag: "Public Safety",
      tagColor: TAG_COLORS["Public Safety"],
      author: "Barangay Captain",
    },
    {
      id: 5,
      title: "Road Clearing Operations",
      content:
        "The barangay will conduct road clearing operations along Rizal Avenue and Del Pilar Street starting May 6, 2026. Illegally parked vehicles and obstructions will be removed. All residents and business owners are advised to comply with local ordinances.",
      date: "Apr 28, 2026",
      tag: "Infrastructure",
      tagColor: TAG_COLORS["Infrastructure"],
      author: "Barangay Engineer",
    },
    {
      id: 6,
      title: "Reminder: Curfew for Minors",
      content:
        "The barangay reminds all residents that Barangay Ordinance No. 2019-03 prohibits minors below 18 years of age from loitering in public places between 10:00 PM and 5:00 AM. Parents and guardians are held responsible for ensuring compliance.",
      date: "Apr 20, 2026",
      tag: "General",
      tagColor: TAG_COLORS["General"],
      author: "Barangay Secretary",
    },
  ];

  const ALL_TAGS = ["All", ...Object.keys(TAG_COLORS)];

  function AnnouncementCard({ item }: { item: Announcement }) {
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

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${item.tagColor}`}
              >
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
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">Posted by: {item.author}</p>
      </article>
    );
  }

  export default function AnnouncementsPage() {
    const [tag, setTag] = useState("All");
    const [search, setSearch] = useState("");
    const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);

    useEffect(() => {
      fetch("/api/resident/announcements")
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            setAnnouncements(
              result.data.map((item: Announcement) => ({
                ...item,
                tagColor: TAG_COLORS[item.tag] ?? TAG_COLORS.General,
              }))
            );
          }
        })
        .catch(() => setAnnouncements(ANNOUNCEMENTS));
    }, []);

    const filtered = announcements.filter((a) => {
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
                  <h1 className="mt-1 text-xl font-bold">Announcements</h1>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Megaphone className="h-5 w-5" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="hidden lg:block">
              <PageHeader
                title="Announcements"
                description="Official barangay advisories, events, and public safety updates."
                icon={<Megaphone className="h-5 w-5 text-white" />}
              />
            </div>

            <div className="mx-auto w-full max-w-md space-y-4 pb-24 lg:max-w-6xl lg:space-y-6 lg:pb-0">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.35fr]">
                <div className="order-2 space-y-3 lg:order-1">
                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center">
                      <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-muted-foreground">No announcements found</p>
                    </div>
                  ) : (
                    <>
                      {pinned.length > 0 && (
                        <div className="space-y-3">
                          {pinned.map((a) => (
                            <AnnouncementCard key={a.id} item={a} />
                          ))}
                        </div>
                      )}
                      {rest.length > 0 && (
                        <div className="space-y-3">
                          {pinned.length > 0 && (
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              All Announcements
                            </p>
                          )}
                          {rest.map((a) => (
                            <AnnouncementCard key={a.id} item={a} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <aside className="order-1 space-y-4 lg:order-2">
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</p>
                    <div className="relative mt-3">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search announcements..."
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filter by tag</p>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {ALL_TAGS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTag(t)}
                          className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            tag === t
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-border bg-background text-muted-foreground hover:border-[var(--primary)]/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Community Brief</p>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      Pinned announcements show critical advisories first. Tap any card to expand full details.
                    </p>
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
