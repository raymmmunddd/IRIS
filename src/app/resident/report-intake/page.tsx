"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, CircleCheck, Gavel, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth"
import { createResidentCaseReport } from "@/lib/caseStorage"
import {
  CATEGORY_SCOPE_RULES,
  evaluateResidentReportScope,
  type ScopeEvaluation,
} from "@/lib/residentReportScope"
import type { CaseCategory } from "@/lib/types"

const categories: CaseCategory[] = [
  "Violence or Threats",
  "Harassment & Abuse",
  "Fraud & Scams",
  "Public Disturbance",
  "Property & Theft",
  "Community Dispute",
  "Child & Vulnerable Protection",
]

const hearingFlow = [
  "Blotter intake and formal complaint recording.",
  "Initial hearing schedule within 5 working days (excluding weekends).",
  "Summons and notices sent within 2 days.",
  "If unresolved on first hearing, second mediation hearing is scheduled.",
  "Lupon conciliation runs up to 15 days and may be extended by the barangay captain.",
  "Case progress should be resolved/unresolved within 60 days.",
  "Settlement non-compliance may be reopened through repudiation within 10 days.",
]

export default function ResidentReportIntakePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [street, setStreet] = useState("")
  const [incidentDate, setIncidentDate] = useState("")
  const [incidentCity, setIncidentCity] = useState("Olongapo City")
  const [category, setCategory] = useState<CaseCategory>("Community Dispute")
  const [details, setDetails] = useState("")
  const [estimatedClaimAmount, setEstimatedClaimAmount] = useState("")
  const [respondentWithinBarangay, setRespondentWithinBarangay] = useState(true)
  const [respondentHomeless, setRespondentHomeless] = useState(false)
  const [possiblePenaltyOverOneYear, setPossiblePenaltyOverOneYear] = useState(false)
  const [coveredByBarangayOrdinance, setCoveredByBarangayOrdinance] = useState(true)
  const [flagCybercrime, setFlagCybercrime] = useState(false)
  const [flagDefamation, setFlagDefamation] = useState(false)
  const [flagVehicularAccident, setFlagVehicularAccident] = useState(false)
  const [flagHumanRights, setFlagHumanRights] = useState(false)
  const [submitEvaluation, setSubmitEvaluation] = useState<ScopeEvaluation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const user = getAuthUser()

    if (!user) {
      router.push("/login?role=resident")
      return
    }

    if (!isRoleAuthorized(["resident"])) {
      router.push(getRoleLandingPath(user.role))
      return
    }

    if (!fullName) {
      setFullName(user.email)
      setEmail(user.email)
    }
  }, [fullName, router])

  const scopeProfile = CATEGORY_SCOPE_RULES[category]
  const parsedAmount = estimatedClaimAmount ? Number(estimatedClaimAmount) : null

  const liveEvaluation = useMemo(
    () =>
      evaluateResidentReportScope({
        category,
        incidentCity,
        respondentWithinBarangay,
        respondentHomeless,
        estimatedClaimAmount: parsedAmount,
        possiblePenaltyOverOneYear,
        coveredByBarangayOrdinance,
        flags: {
          cybercrime: flagCybercrime,
          defamationOutsideScope: flagDefamation,
          vehicularAccident: flagVehicularAccident,
          humanRightsViolation: flagHumanRights,
        },
      }),
    [
      category,
      incidentCity,
      respondentWithinBarangay,
      respondentHomeless,
      parsedAmount,
      possiblePenaltyOverOneYear,
      coveredByBarangayOrdinance,
      flagCybercrime,
      flagDefamation,
      flagVehicularAccident,
      flagHumanRights,
    ]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!fullName || !contact || !street || !incidentDate || !details) {
      toast({ title: "Missing details", description: "Please complete all required report details." })
      return
    }

    setIsSubmitting(true)
    const evaluation = evaluateResidentReportScope({
      category,
      incidentCity,
      respondentWithinBarangay,
      respondentHomeless,
      estimatedClaimAmount: parsedAmount,
      possiblePenaltyOverOneYear,
      coveredByBarangayOrdinance,
      flags: {
        cybercrime: flagCybercrime,
        defamationOutsideScope: flagDefamation,
        vehicularAccident: flagVehicularAccident,
        humanRightsViolation: flagHumanRights,
      },
    })

    setSubmitEvaluation(evaluation)

    if (!evaluation.allowed) {
      setIsSubmitting(false)
      toast({
        title: "Report outside barangay scope",
        description: "Please review restrictions and referral guidance before filing.",
        variant: "destructive",
      })
      return
    }

    const created = createResidentCaseReport({
      fullName,
      category,
      incidentDate,
      contact,
      email,
      street,
      details,
    })

    setIsSubmitting(false)

    if (!created) {
      toast({ title: "Submission failed", description: "Unable to save report. Please try again.", variant: "destructive" })
      return
    }

    toast({
      title: "Report filed",
      description: `${created.caseNumber} was filed successfully under ${category}.`,
    })
    router.push("/resident")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6 lg:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/resident" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Resident Portal
          </Link>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Katarungang Pambarangay Intake
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-xl border border-border bg-card p-5">
            <h1 className="text-xl font-semibold">Resident Report Intake</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit incidents within barangay scope. Category restrictions are shown per report.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Complainant Name *</span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Contact Number *</span>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Email (optional)</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Incident Date *</span>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(event) => setIncidentDate(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Address / Street *</span>
                <input
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Report Category *</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as CaseCategory)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Incident City *</span>
                  <input
                    value={incidentCity}
                    onChange={(event) => setIncidentCity(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Incident Details *</span>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Estimated Claim Amount (PHP)</span>
                  <input
                    type="number"
                    min={0}
                    value={estimatedClaimAmount}
                    onChange={(event) => setEstimatedClaimAmount(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Scope Checks</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={respondentWithinBarangay} onChange={(e) => setRespondentWithinBarangay(e.target.checked)} />
                    Respondent is within barangay jurisdiction
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={coveredByBarangayOrdinance} onChange={(e) => setCoveredByBarangayOrdinance(e.target.checked)} />
                    Covered by barangay ordinance/law
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={possiblePenaltyOverOneYear} onChange={(e) => setPossiblePenaltyOverOneYear(e.target.checked)} />
                    Possible penalty is over 1 year imprisonment
                  </label>
                </div>
              </div>

              <div className="grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 md:grid-cols-2">
                <p className="text-sm font-medium text-amber-900 md:col-span-2">Mark if incident falls in restricted handling</p>
                <label className="flex items-center gap-2 text-sm text-amber-900">
                  <input type="checkbox" checked={flagCybercrime} onChange={(e) => setFlagCybercrime(e.target.checked)} /> Cybercrime
                </label>
                <label className="flex items-center gap-2 text-sm text-amber-900">
                  <input type="checkbox" checked={flagDefamation} onChange={(e) => setFlagDefamation(e.target.checked)} /> Defamation outside scope
                </label>
                <label className="flex items-center gap-2 text-sm text-amber-900">
                  <input type="checkbox" checked={flagVehicularAccident} onChange={(e) => setFlagVehicularAccident(e.target.checked)} /> Vehicular accident
                </label>
                <label className="flex items-center gap-2 text-sm text-amber-900">
                  <input type="checkbox" checked={flagHumanRights} onChange={(e) => setFlagHumanRights(e.target.checked)} /> Human rights violation
                </label>
                <label className="flex items-center gap-2 text-sm text-amber-900 md:col-span-2">
                  <input type="checkbox" checked={respondentHomeless} onChange={(e) => setRespondentHomeless(e.target.checked)} /> Respondent is homeless (humanitarian referral)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {isSubmitting ? "Checking scope..." : "Submit Barangay Report"}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Category Scope: {scopeProfile.title}</h2>

              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="font-medium text-emerald-700">Allowed in barangay intake</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    {scopeProfile.inScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-rose-700">Outside scope for direct filing/referral</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    {scopeProfile.outOfScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sky-700">Reporter reminders</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    {scopeProfile.reminders.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {!liveEvaluation.allowed && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-800">
                  <ShieldAlert className="h-4 w-4" />
                  Report will be blocked with current scope flags
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-800">
                  {liveEvaluation.blockers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {submitEvaluation && !submitEvaluation.allowed && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Referral guidance
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {submitEvaluation.referrals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Gavel className="h-4 w-4 text-primary" />
                Hearing and Resolution Process
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {hearingFlow.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CircleCheck className="h-4 w-4" />
                Reporter reminders
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
                {liveEvaluation.notices.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}