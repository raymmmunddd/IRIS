"use client";

import Link from "next/link";
import {
  FileText,
  Shield,
  BarChart3,
  Users,
  ClipboardList,
  Bell,
  ChevronRight,
  ArrowRight,
  Scale,
  Clock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ClipboardCheck,
  Database,
  UserCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
];

const STATS = [
  { value: "60", label: "Day Case Limit" },
  { value: "5", label: "Day Hearing Window" },
  { value: "100%", label: "Barangay-Focused" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Incident Reporting",
    desc: "Residents submit complaints with evidence, parties involved, and case type. The system automatically validates jurisdiction before processing.",
    color: "#3B6FE0",
  },
  {
    icon: Shield,
    title: "Case Review & Blotter",
    desc: "Admins review, accept, reject, or refer each submission. Accepted cases are officially recorded and assigned a blotter entry.",
    color: "#2563EB",
  },
  {
    icon: Users,
    title: "BPAT Assignment",
    desc: "Barangay officers are dispatched for field verification, documentation, and coordination, separate from the mediation process.",
    color: "#1D4ED8",
  },
  {
    icon: Scale,
    title: "Lupon Mediation",
    desc: "The Lupon Tagapamayapa conducts structured hearings with attendance tracking, stage progression, and outcome documentation.",
    color: "#1E40AF",
  },
  {
    icon: ClipboardList,
    title: "Settlement (Kasunduan)",
    desc: "Resolved cases produce a signed Kasunduan agreement stored in the system, with optional supporting proof attached.",
    color: "#1E3A8A",
  },
  {
    icon: BarChart3,
    title: "Analytics & Monitoring",
    desc: "Real-time dashboards track case trends, officer workloads, resolution rates, and compliance within the 60-day case window.",
    color: "#312E81",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Resident Submits Report",
    desc: "A resident files an incident complaint through the portal. The system checks jurisdiction automatically.",
  },
  {
    num: "02",
    title: "Admin Reviews Case",
    desc: "Barangay admin accepts, rejects, or refers the case. Accepted cases become official blotter entries.",
  },
  {
    num: "03",
    title: "BPAT Dispatched",
    desc: "An officer is assigned for field verification and documentation. First hearing is scheduled within 5 days.",
  },
  {
    num: "04",
    title: "Lupon Mediation",
    desc: "The Lupon Tagapamayapa conducts hearings. Unresolved cases move to a 15-day conciliation stage.",
  },
  {
    num: "05",
    title: "Resolution & Monitoring",
    desc: "Resolved cases produce a signed Kasunduan. Compliance is monitored for 10 days before permanent closure.",
  },
];

const ROLES = [
  {
    icon: Users,
    role: "Resident",
    color: "#3B6FE0",
    bg: "#EEF2FF",
    perks: [
      "Submit incident reports",
      "Upload supporting evidence",
      "Track case status in real-time",
      "Receive barangay notifications",
    ],
  },
  {
    icon: Shield,
    role: "Admin / Barangay Official",
    color: "#2563EB",
    bg: "#DBEAFE",
    perks: [
      "Review and validate submissions",
      "Assign BPAT officers",
      "Schedule Lupon hearings",
      "Close and archive cases",
    ],
  },
  {
    icon: Scale,
    role: "BPAT Officer",
    color: "#1D4ED8",
    bg: "#BFDBFE",
    perks: [
      "Receive field assignments",
      "Document case findings",
      "Coordinate with barangay",
      "Track hearing schedules",
    ],
  },
];

const AUTH_THEME = {
  bg: "#F5F7FB",
  dark: "#091225",
  dark2: "#101B35",
  dark3: "#14264A",
  gold: "#D9A514",
  goldSoft: "rgba(217,165,20,0.18)",
  whiteSoft: "rgba(255,255,255,0.06)",
  borderSoft: "rgba(255,255,255,0.12)",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFF",
  text: "#0F172A",
  textMuted: "#475569",
};

const legalContent = {
  terms: {
    title: "Terms of Service",
    intro:
      "These Terms govern your use of IRIS (Incident Report and Information System) for community reporting and case tracking.",
    body: [
      "Account Responsibility: Keep your credentials secure and notify administrators of unauthorized use.",
      "Acceptable Use: Provide truthful reports and avoid impersonation, harassment, or abusive content.",
      "Role-Based Access: Use only the features permitted to your assigned role and do not attempt to bypass access controls.",
      "Evidence & Content: Upload only relevant materials you have the right to share for case handling.",
      "Service Availability: IRIS may undergo updates, maintenance, or temporary outages to improve security and reliability.",
      "Enforcement: Accounts may be reviewed, suspended, or removed for violations of these Terms.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "IRIS protects your personal and case data by limiting collection to what is required for operations, safety, and legal compliance.",
    body: [
      "Data We Collect: Name, email, contact, street, gender, role, and account credentials (stored securely).",
      "Case Information: Incident reports, evidence uploads, messages, and case updates needed for barangay workflows.",
      "How We Use Data: Verification, case management, notifications, analytics, and service improvement.",
      "Access & Sharing: Data is shared only with authorized barangay staff and officers for official purposes.",
      "Retention: Account and case data may be retained for audits, legal compliance, and public safety needs.",
      "Your Rights: You can request corrections or updates to your profile through the barangay administrator.",
    ],
  },
} as const;

function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", window.location.pathname);
  }
}

export default function Home() {
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);

  const openLegalDoc = (doc: "terms" | "privacy") => {
    setLegalDoc(doc);
  };

  return (
    <div className="min-h-screen bg-[var(--iris-bg)] text-[var(--iris-text)] font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[rgba(127,176,255,0.18)] bg-[rgba(9,18,37,0.86)] px-6 py-4 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[rgba(127,176,255,0.18)]">
            <Image
              src="/NewKalalake.png"
              alt="Barangay New Kalalake Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-bold tracking-tight text-yellow-300">IRIS</span>
          <span className="ml-1 hidden text-xs text-[#7FB0FF] sm:inline">Barangay New Kalalake</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => smoothScroll(e, l.href)}
              className="text-sm font-medium text-yellow-300 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[rgba(217,165,20,0.24)] bg-[rgba(217,165,20,0.12)] px-4 py-1.5 text-sm font-semibold text-[var(--iris-primary-strong)] transition-colors hover:bg-[rgba(217,165,20,0.18)]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-yellow-300"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section
        className="relative overflow-hidden px-6 pb-24 pt-32 md:px-12"
        style={{
          background: `
            radial-gradient(circle at top left, ${AUTH_THEME.goldSoft}, transparent 34%),
            radial-gradient(circle at bottom right, rgba(255,255,255,0.06), transparent 42%),
            linear-gradient(150deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 38%, ${AUTH_THEME.dark3} 72%, ${AUTH_THEME.dark} 100%)
          `,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(217,165,20,0.2), transparent 18%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.16), transparent 20%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-yellow-300 shadow-sm backdrop-blur-sm">
            <MapPin size={11} />
            Barangay New Kalalake · Olongapo City
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white leading-[1.05] md:text-7xl">
            Incident Reports,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #F5F3E6 0%, #D9A514 45%, #FFF2B3 100%)",
              }}
            >
              Handled Right.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl">
            IRIS is a digital case management system for Barangay New Kalalake From incident
            filing to Lupon mediation, every step is tracked and documented.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
                className="flex items-center gap-2 rounded-xl bg-yellow-400 px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Sign In <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => smoothScroll(e, "#how-it-works")}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#7FB0FF] transition-colors hover:text-white"
            >
              See how it works <ChevronRight size={15} />
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/6 shadow-sm backdrop-blur-sm md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="border-white/10 px-6 py-5 text-center text-white md:border-r md:last:border-r-0">
              <div className="text-2xl font-extrabold text-[var(--iris-primary)]">{s.value}</div>
              <div className="mt-1 text-xs font-medium text-white/68">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-24 md:px-12"
        style={{
          background: `linear-gradient(150deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 42%, ${AUTH_THEME.dark3} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-300">
              Platform Features
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Everything in one system
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#7FB0FF]">
              From submission to settlement, IRIS handles every step of the Katarungang
              Pambarangay process digitally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-[rgba(127,176,255,0.16)] bg-[rgba(127,176,255,0.08)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[rgba(127,176,255,0.3)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(217,165,20,0.18)" }}
                  >
                    <Icon size={18} style={{ color: "#ffffff" }} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-yellow-300">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-white/70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-6 py-24 md:px-12"
        style={{
          background: `linear-gradient(150deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 40%, ${AUTH_THEME.dark3} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-300">
              The Process
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              How a case moves through IRIS
            </h2>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-[22px] top-0 hidden w-px bg-gradient-to-b from-yellow-300 via-white/35 to-transparent md:block" />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-300 text-xs font-bold text-[var(--iris-primary-strong)] shadow-md shadow-black/20">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl border border-[rgba(127,176,255,0.16)] bg-[rgba(127,176,255,0.08)] p-5 transition-colors hover:border-[rgba(127,176,255,0.3)] hover:bg-[rgba(127,176,255,0.12)]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#7FB0FF]">
                      {s.num}
                    </span>
                    <h3 className="mb-1 mt-0.5 text-sm font-bold text-yellow-300">{s.title}</h3>
                    <p className="text-xs leading-relaxed text-white/78">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-yellow-300" />
              First hearing within 5 business days
            </span>
            <span className="flex items-center gap-1.5">
              <Bell size={12} className="text-yellow-300" />
              Respondent notified within 2 days
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-yellow-300" />
              60-day maximum case duration
            </span>
          </div>
        </div>
      </section>

      <section
        id="roles"
        className="px-6 py-24 md:px-12"
        style={{
          background: `linear-gradient(150deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 42%, ${AUTH_THEME.dark3} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-300">
              User Roles
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Built for every stakeholder
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
              IRIS gives each role exactly the tools they need, nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.role}
                  className="rounded-2xl border border-[rgba(127,176,255,0.16)] bg-[rgba(127,176,255,0.08)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[rgba(127,176,255,0.3)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(217,165,20,0.18)" }}
                  >
                    <Icon size={18} style={{ color: "#ffffff" }} />
                  </div>
                  <h3 className="mb-4 text-sm font-bold text-yellow-300">{r.role}</h3>
                  <ul className="space-y-2">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-yellow-300" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="px-6 py-24 md:px-12"
        style={{
          background: `radial-gradient(circle at top left, ${AUTH_THEME.goldSoft}, transparent 34%), linear-gradient(135deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 46%, ${AUTH_THEME.dark3} 100%)`,
        }}
      >
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-300">
              Ready to get started?
            </p>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Your barangay, better managed.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/72">
              Join IRIS to file reports, track cases, and stay informed about your community all
              in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-yellow-400 px-7 py-3 text-sm font-bold text-black shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Create an Account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[rgba(127,176,255,0.25)] bg-[rgba(127,176,255,0.08)] px-7 py-3 text-sm font-medium text-[#7FB0FF] transition-all hover:bg-[rgba(127,176,255,0.14)]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="relative overflow-hidden border-t border-[rgba(127,176,255,0.18)]"
        style={{
          background: `linear-gradient(150deg, ${AUTH_THEME.dark} 0%, ${AUTH_THEME.dark2} 42%, ${AUTH_THEME.dark3} 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">

            {/* BRAND */}
            <div className="flex items-start gap-4 max-w-xl">
              <div className="w-11 h-11 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-[var(--iris-border)] shadow-sm flex items-center justify-center">
                <Image
                  src="/NewKalalake.png"
                  alt="Barangay New Kalalake Logo"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-bold tracking-tight text-sm text-white sm:text-base">
                    IRIS
                  </span>

                  <span className="hidden text-white/30 sm:inline">•</span>

                  <span className="text-xs font-medium leading-relaxed text-white/70">
                    Incident Report & Information System
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-white/70">
                  Digital barangay case management platform for incident reporting,
                  Lupon mediation, and community coordination.
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--iris-text-subtle)]">
                  <MapPin size={12} />
                  Barangay New Kalalake, Olongapo City
                </div>
              </div>
            </div>

            {/* LINKS */}
            <div className="w-full sm:w-auto grid grid-cols-2 gap-10 sm:gap-14">

              {/* NAVIGATION */}
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/70">
                  Navigation
                </p>

                <div className="flex flex-col gap-2.5">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => smoothScroll(e, link.href)}
                      className="text-sm leading-6 text-white/70 transition-colors hover:text-yellow-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* LEGAL */}
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/70">
                  Legal
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => openLegalDoc("terms")}
                    className="text-left text-sm leading-6 text-white/70 transition-colors hover:text-yellow-300"
                  >
                    Terms of Service
                  </button>

                  <button
                    type="button"
                    onClick={() => openLegalDoc("privacy")}
                    className="text-left text-sm leading-6 text-white/70 transition-colors hover:text-yellow-300"
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
            </div>

            {legalDoc && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl">
                  <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl border border-[var(--iris-border)] bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">

                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b border-[var(--iris-border)] bg-[linear-gradient(90deg,rgba(9,18,37,0.03),rgba(255,255,255,1))] px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)]">
                          <ShieldCheck className="h-5 w-5 text-[var(--iris-primary)]" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-[var(--iris-text)]">
                            {legalContent[legalDoc].title}
                          </h3>

                          <p className="text-xs text-[var(--iris-text-subtle)]">
                            IRIS Legal Documentation
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLegalDoc(null)}
                        aria-label="Close dialog"
                        className="rounded-full p-2 text-[var(--iris-text-subtle)] transition-all hover:bg-[var(--iris-primary-light)] hover:text-[var(--iris-primary)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">

                      {/* INTRO */}
                      <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                        <p className="text-sm font-medium leading-relaxed text-slate-700">
                          {legalContent[legalDoc].intro}
                        </p>
                      </div>

                      {/* CONTENT */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {legalContent[legalDoc].body.map((item, index) => {
                          const [heading, ...rest] = item.split(": ");
                          const detail = rest.join(": ");

                          const icons = [
                            ShieldCheck,
                            ClipboardCheck,
                            Database,
                            UserCheck,
                          ] as const;

                          const Icon = icons[index % icons.length];

                          return (
                            <div
                              key={item}
                              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(127,176,255,0.3)] hover:shadow-md"
                            >
                              <div className="mb-3 flex items-center gap-2">
                                <div className="rounded-xl bg-[rgba(217,165,20,0.14)] p-2 transition-colors group-hover:bg-[rgba(217,165,20,0.24)] group-hover:text-white">
                                  <Icon className="h-4 w-4 text-yellow-600 group-hover:text-yellow-700" />
                                </div>

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-900 transition-colors group-hover:text-yellow-700">
                                  {heading}
                                </p>
                              </div>

                              <p className="text-xs leading-relaxed text-slate-900">
                                {detail}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                      <p className="text-xs text-slate-400">
                        RA 10173 • Data Privacy Compliant
                      </p>

                      <button
                        type="button"
                        onClick={() => setLegalDoc(null)}
                        className="rounded-xl bg-[var(--iris-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--iris-primary-strong)]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[rgba(127,176,255,0.12)] pt-6 sm:flex-row">
            <p className="text-xs text-white/70">© 2026 IRIS System. All rights reserved.</p>

            <div className="flex items-center gap-5 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-yellow-300" />
                Secure Barangay Platform
              </span>

              <span className="hidden sm:inline text-white/20">|</span>

              <span>RA 10173 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}