"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Gavel,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { ResidentNav } from "@/components/ResidentNav";
import { ResidentSidebar } from "@/components/resident/sidebar";
import { PageHeader } from "@/components/ui/page-header";

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "How do I file a complaint?",
    answer:
      'Go to your resident home page and tap "Report Incident." Fill in the required details including the incident type, date, and description. The system will automatically check if your complaint falls within barangay jurisdiction before submission.',
  },
  {
    question: "What types of cases can the barangay handle?",
    answer:
      "The barangay can handle disputes, minor injuries, public disturbances, ordinance violations, community disputes, and certain harassment cases under the Katarungang Pambarangay law. Cases involving crimes with penalties over 1 year imprisonment, cybercrimes, or human rights violations are referred to higher authorities.",
  },
  {
    question: "How long will my case take?",
    answer:
      "Under the Katarungang Pambarangay process, cases must be resolved within 60 days. The first hearing is scheduled within 5 business days of acceptance. If unresolved in mediation, the case enters a 15-day conciliation period which may be extended by the Barangay Captain.",
  },
  {
    question: "What happens if I miss a hearing?",
    answer:
      "If you (as complainant) are absent in two consecutive hearings without valid reason, your case may be dismissed. If the respondent is absent, they may lose their right to file a counterclaim. It is important to attend all scheduled hearings.",
  },
  {
    question: "What is a Kasunduan?",
    answer:
      "A Kasunduan is the settlement agreement signed by both parties once a case is resolved through mediation or conciliation. It is legally binding and stored in the IRIS system. Non-compliance within 10 days may result in case reopening (repudiation).",
  },
  {
    question: "Can I track my case online?",
    answer:
      'Yes. Go to "My Cases" from your resident home or bottom navigation. You will see all your filed reports, their current status, and the latest updates including officer assignments and hearing schedules.',
  },
  {
    question: "Who are the BPAT officers?",
    answer:
      "BPAT (Barangay Peace and Action Team) officers are barangay-assigned field officers responsible for verification, documentation, and coordination. They do not conduct mediation — that is handled separately by the Lupon Tagapamayapa.",
  },
  {
    question: "What is the Lupon Tagapamayapa?",
    answer:
      "The Lupon Tagapamayapa is the barangay body responsible for conducting mediation and conciliation hearings under the Katarungang Pambarangay process. They facilitate peaceful settlement of disputes between parties at the community level.",
  },
];

const CONTACTS = [
  {
    label: "Barangay Hall Hotline",
    value: "(047) 222-XXXX",
    icon: Phone,
    action: "tel:+63472220000",
  },
  {
    label: "Email the Barangay",
    value: "eastapinac@barangay.gov.ph",
    icon: Mail,
    action: "mailto:eastapinac@barangay.gov.ph",
  },
  {
    label: "Facebook Page",
    value: "Barangay East Tapinac Official",
    icon: ExternalLink,
    action: "https://facebook.com",
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-foreground leading-snug">{faq.question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
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
                <h1 className="mt-1 text-xl font-bold">Help Center</h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <LifeBuoy className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Help Center"
              description="Barangay process guidance, FAQs, and contact channels for residents."
              icon={<LifeBuoy className="h-5 w-5 text-white" />}
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-5 pb-24 lg:max-w-6xl lg:space-y-6 lg:pb-0">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5 lg:space-y-6">
                <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
                  <div className="flex items-start gap-3">
                    <Gavel className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Katarungang Pambarangay</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        The IRIS system follows the Katarungang Pambarangay process for community-level
                        dispute resolution. Read below to understand your rights and responsibilities.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Frequently Asked Questions
                  </p>
                  <div className="space-y-2">
                    {FAQS.map((faq) => (
                      <FAQItem key={faq.question} faq={faq} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5 lg:space-y-6">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Contact the Barangay
                  </p>
                  <div className="space-y-2">
                    {CONTACTS.map((c) => {
                      const Icon = c.icon;
                      return (
                        <a
                          key={c.label}
                          href={c.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-[var(--primary)]/30 hover:shadow-md"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                            <Icon className="h-4 w-4 text-[var(--primary)]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{c.label}</p>
                            <p className="text-xs text-muted-foreground">{c.value}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Still need help?</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Visit the Barangay Hall in person during office hours (Mon–Fri, 8:00 AM – 5:00 PM)
                        or call the hotline above. Our staff is ready to assist.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Office Hours</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Barangay Hall</p>
                  <p className="mt-1 text-xs text-muted-foreground">Monday to Friday, 8:00 AM – 5:00 PM</p>
                </div>
              </div>
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