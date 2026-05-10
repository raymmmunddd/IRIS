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
} from "lucide-react";
import Image from "next/image"

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
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
            <Image
              src="/EastTapinac.png"
              alt="Barangay East Tapinac Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-[#0F172A] tracking-tight">IRIS</span>
          <span className="hidden sm:inline text-xs text-slate-400 ml-1">Barangay East Tapinac</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => smoothScroll(e, l.href)}
              className="text-sm text-slate-500 hover:text-[#1D4ED8] transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.13) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(59,111,224,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(90deg, #1D4ED8 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#1D4ED8] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <MapPin size={11} />
            Barangay East Tapinac · Olongapo City
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05] mb-6">
            Incident Reports,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #1D4ED8 0%, #3B6FE0 50%, #60A5FA 100%)",
              }}
            >
              Handled Right.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            IRIS is a digital case management system for Barangay East Tapinac From incident
            filing to Lupon mediation, every step is tracked and documented.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
            >
              Sign In <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => smoothScroll(e, "#how-it-works")}
              className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] font-medium text-sm transition-colors px-4 py-3"
            >
              See how it works <ChevronRight size={15} />
            </a>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-5 text-center">
              <div className="text-2xl font-extrabold text-[#1D4ED8]">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-6 md:px-12 bg-[#F8FAFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest mb-3">
              Platform Features
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">
              Everything in one system
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
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
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${f.color}15` }}
                  >
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2 text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest mb-3">
              The Process
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">
              How a case moves through IRIS
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-[#1D4ED8] via-blue-200 to-transparent hidden md:block" />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200 z-10 relative">
                      {i + 1}
                    </div>
                  </div>
                  <div className="bg-[#F8FAFF] border border-slate-100 rounded-2xl p-5 flex-1 hover:border-blue-100 transition-colors">
                    <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest">
                      {s.num}
                    </span>
                    <h3 className="font-bold text-[#0F172A] text-sm mt-0.5 mb-1">{s.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#1D4ED8]" />
              First hearing within 5 business days
            </span>
            <span className="flex items-center gap-1.5">
              <Bell size={12} className="text-[#1D4ED8]" />
              Respondent notified within 2 days
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#1D4ED8]" />
              60-day maximum case duration
            </span>
          </div>
        </div>
      </section>

      <section id="roles" className="py-24 px-6 md:px-12 bg-[#F8FAFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest mb-3">
              User Roles
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">
              Built for every stakeholder
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              IRIS gives each role exactly the tools they need, nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.role}
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-50 hover:border-blue-200 transition-all"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: r.bg }}
                  >
                    <Icon size={18} style={{ color: r.color }} />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-4 text-sm">{r.role}</h3>
                  <ul className="space-y-2">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-slate-500">
                        <CheckCircle2 size={13} className="text-[#1D4ED8] mt-0.5 flex-shrink-0" />
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

      <section className="py-24 px-6 md:px-12 bg-white">
        <div
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative text-center py-16 px-8"
          style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #3B6FE0 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">
              Ready to get started?
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Your barangay, better managed.
            </h2>
            <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join IRIS to file reports, track cases, and stay informed about your community all
              in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="bg-white text-[#1D4ED8] hover:bg-blue-50 font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5"
              >
                Create an Account
              </Link>
              <Link
                href="/login"
                className="text-white border border-white/30 hover:bg-white/10 font-medium px-7 py-3 rounded-xl text-sm transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 px-6 md:px-12 py-8 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1D4ED8] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">I</span>
            </div>
            <span className="font-semibold text-slate-500">IRIS</span>
            <span>·</span>
            <span>Barangay East Tapinac, Olongapo City</span>
          </div>
          <span>© 2026 IRIS System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}