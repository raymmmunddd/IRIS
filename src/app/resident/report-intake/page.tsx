"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Gavel,
  Info,
  Scale,
  ShieldAlert,
} from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { ResidentSidebar } from "@/components/resident/sidebar"
import { ResidentNav } from "@/components/ResidentNav"
import { PageHeader } from "@/components/ui/page-header"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  getAuthUser,
  getRoleLandingPath,
  isRoleAuthorized,
} from "@/lib/auth"

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

export default function ResidentReportIntakePage() {
  const router = useRouter()
  const { toast } = useToast()
  const initialUser = getAuthUser()

  const [fullName, setFullName] = useState(initialUser?.email ?? "")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState(initialUser?.email ?? "")
  const [street, setStreet] = useState("")
  const [incidentDate, setIncidentDate] = useState("")
  const [incidentCity, setIncidentCity] = useState("Olongapo City")
  const [category, setCategory] =
    useState<CaseCategory>("Community Dispute")
  const [details, setDetails] = useState("")
  const [estimatedClaimAmount, setEstimatedClaimAmount] = useState("")

  const [respondentWithinBarangay, setRespondentWithinBarangay] =
    useState(true)

  const [respondentHomeless, setRespondentHomeless] =
    useState(false)

  const [possiblePenaltyOverOneYear, setPossiblePenaltyOverOneYear] =
    useState(false)

  const [coveredByBarangayOrdinance, setCoveredByBarangayOrdinance] =
    useState(true)

  const [flagCybercrime, setFlagCybercrime] = useState(false)
  const [flagDefamation, setFlagDefamation] = useState(false)
  const [flagVehicularAccident, setFlagVehicularAccident] =
    useState(false)
  const [flagHumanRights, setFlagHumanRights] = useState(false)

  const [submitEvaluation, setSubmitEvaluation] =
    useState<ScopeEvaluation | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [openGuide, setOpenGuide] = useState(true)
  const [openScopeModal, setOpenScopeModal] = useState(false)
  const [openRestrictionModal, setOpenRestrictionModal] =
    useState(false)

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
  }, [router])

  useEffect(() => {
    if (
      flagCybercrime ||
      flagHumanRights ||
      flagVehicularAccident ||
      possiblePenaltyOverOneYear
    ) {
      setOpenRestrictionModal(true)
    }
  }, [
    flagCybercrime,
    flagHumanRights,
    flagVehicularAccident,
    possiblePenaltyOverOneYear,
  ])

  const scopeProfile = CATEGORY_SCOPE_RULES[category]

  const parsedAmount = estimatedClaimAmount
    ? Number(estimatedClaimAmount)
    : null

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (
      !fullName ||
      !contact ||
      !street ||
      !incidentDate ||
      !details
    ) {
      toast({
        title: "Missing details",
        description:
          "Please complete all required report details.",
      })
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
        description:
          "Please review restrictions before filing.",
        variant: "destructive",
      })

      setOpenRestrictionModal(true)
      return
    }

    let created: { id: string } | null = null

    try {
      const response = await fetch("/api/resident/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          category,
          incidentDate,
          contact,
          email,
          street,
          details,
        }),
      })

      const result = await response.json()
      created = result.success ? result.data : null
    } catch {
      created = null
    }

    setIsSubmitting(false)

    if (!created) {
      toast({
        title: "Submission failed",
        description:
          "Unable to save report. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Report filed",
      description: `${created.id} was filed successfully.`,
    })

    router.push("/resident")
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <div className="hidden lg:flex h-screen shrink-0">
          <ResidentSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="hidden lg:block">
              <PageHeader
                title="Submit A Report"
                description="Submit incidents within barangay scope. Category restrictions are shown per report."
                icon={<Gavel className="h-5 w-5 text-white" />}
              />
            </div>

            <div className="mx-auto w-full max-w-4xl space-y-6 pb-24">
              <div className="flex items-center justify-between">
                <Link
                  href="/resident"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Resident Portal
                </Link>

                <button
                  type="button"
                  onClick={() => setOpenGuide(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                >
                  <Info className="h-4 w-4" />
                  Help Guide
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <p className="text-3xl">📝</p>
                  <p className="mt-2 text-sm font-medium">
                    Fill Out Report
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <p className="text-3xl">📎</p>
                  <p className="mt-2 text-sm font-medium">
                    Submit Evidence
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 text-center">
                  <p className="text-3xl">⚖</p>
                  <p className="mt-2 text-sm font-medium">
                    Wait For Hearing
                  </p>
                </div>
              </div>

              <section className="rounded-2xl border border-border bg-card p-6">
                <h1 className="text-2xl font-semibold">
                  Submit A Report
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Please provide complete and accurate details.
                </p>

                <form
                  className="mt-6 space-y-5"
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Complainant Name *
                      </span>

                      <input
                        value={fullName}
                        onChange={(event) =>
                          setFullName(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Contact Number *
                      </span>

                      <input
                        value={contact}
                        onChange={(event) =>
                          setContact(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Email (optional)
                      </span>

                      <input
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Incident Date *
                      </span>

                      <input
                        type="date"
                        value={incidentDate}
                        onChange={(event) =>
                          setIncidentDate(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-sm font-medium">
                      Address / Street *
                    </span>

                    <input
                      value={street}
                      onChange={(event) =>
                        setStreet(event.target.value)
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Report Category *
                      </span>

                      <select
                        value={category}
                        onChange={(event) => {
                          setCategory(
                            event.target.value as CaseCategory
                          )
                          setOpenScopeModal(true)
                        }}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Incident City *
                      </span>

                      <input
                        value={incidentCity}
                        onChange={(event) =>
                          setIncidentCity(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-sm font-medium">
                      Incident Details *
                    </span>

                    <textarea
                      value={details}
                      onChange={(event) =>
                        setDetails(event.target.value)
                      }
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                    />

                    <p className="text-xs text-muted-foreground">
                      Include what happened, where it happened,
                      and who was involved.
                    </p>
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm font-medium">
                      Estimated Claim Amount (PHP)
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={estimatedClaimAmount}
                      onChange={(event) =>
                        setEstimatedClaimAmount(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                    />
                  </label>

                  <div className="space-y-3 rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        Quick Scope Check
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenScopeModal(true)
                        }
                        className="text-sm text-primary hover:underline"
                      >
                        View Guide
                      </button>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border p-4">
                      <input
                        type="checkbox"
                        checked={
                          respondentWithinBarangay
                        }
                        onChange={(e) =>
                          setRespondentWithinBarangay(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Respondent is within barangay
                        jurisdiction
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border p-4">
                      <input
                        type="checkbox"
                        checked={
                          coveredByBarangayOrdinance
                        }
                        onChange={(e) =>
                          setCoveredByBarangayOrdinance(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Covered by barangay
                        ordinance/law
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border p-4">
                      <input
                        type="checkbox"
                        checked={
                          possiblePenaltyOverOneYear
                        }
                        onChange={(e) =>
                          setPossiblePenaltyOverOneYear(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Possible penalty is over 1 year
                        imprisonment
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-medium text-amber-900">
                      Restricted Handling
                    </p>

                    <label className="flex items-center gap-3 rounded-xl bg-white p-4">
                      <input
                        type="checkbox"
                        checked={flagCybercrime}
                        onChange={(e) =>
                          setFlagCybercrime(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Cybercrime
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl bg-white p-4">
                      <input
                        type="checkbox"
                        checked={flagDefamation}
                        onChange={(e) =>
                          setFlagDefamation(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Defamation outside scope
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl bg-white p-4">
                      <input
                        type="checkbox"
                        checked={flagVehicularAccident}
                        onChange={(e) =>
                          setFlagVehicularAccident(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Vehicular accident
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl bg-white p-4">
                      <input
                        type="checkbox"
                        checked={flagHumanRights}
                        onChange={(e) =>
                          setFlagHumanRights(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Human rights violation
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl bg-white p-4">
                      <input
                        type="checkbox"
                        checked={respondentHomeless}
                        onChange={(e) =>
                          setRespondentHomeless(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm">
                        Respondent is homeless
                      </span>
                    </label>
                  </div>

                  {!liveEvaluation.allowed && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-medium text-rose-800">
                        <ShieldAlert className="h-4 w-4" />
                        Some report conditions may require
                        referral.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Submitting Report..."
                      : "Submit Report"}
                  </button>
                </form>
              </section>
            </div>
          </main>

          <div className="lg:hidden">
            <ResidentNav />
          </div>
        </div>
      </div>

      {/* GUIDE MODAL */}
      <Dialog open={openGuide} onOpenChange={setOpenGuide}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Report Submission Guide
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg">📝</p>
              <p className="mt-2 font-medium">
                Prepare Your Information
              </p>
              <p className="text-sm text-muted-foreground">
                Provide complete names, dates, and
                incident details.
              </p>
            </div>

            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg">📷</p>
              <p className="mt-2 font-medium">
                Submit Clear Evidence
              </p>
              <p className="text-sm text-muted-foreground">
                Photos and screenshots help validate
                reports.
              </p>
            </div>

            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg">📞</p>
              <p className="mt-2 font-medium">
                Stay Reachable
              </p>
              <p className="text-sm text-muted-foreground">
                Barangay officers may contact you.
              </p>
            </div>

            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg">⚖</p>
              <p className="mt-2 font-medium">
                Attend Hearings
              </p>
              <p className="text-sm text-muted-foreground">
                Both parties may attend mediation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CATEGORY MODAL */}
      <Dialog
        open={openScopeModal}
        onOpenChange={setOpenScopeModal}
      >
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {scopeProfile.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-medium text-emerald-800">
                Allowed
              </p>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
                {scopeProfile.inScope
                  .slice(0, 3)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="font-medium text-rose-800">
                Outside Scope
              </p>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-900">
                {scopeProfile.outOfScope
                  .slice(0, 2)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RESTRICTION MODAL */}
      <Dialog
        open={openRestrictionModal}
        onOpenChange={setOpenRestrictionModal}
      >
        <DialogContent className="rounded-3xl sm:max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-amber-100 p-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>

            <h2 className="text-xl font-semibold">
              Restricted Case Detected
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This report may require referral to
              authorities outside the barangay.
            </p>

            <div className="mt-5 w-full rounded-2xl bg-muted p-4 text-left">
              <p className="font-medium">
                Possible referrals:
              </p>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>PNP Station</li>
                <li>City Prosecutor</li>
                <li>Human Rights Office</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}