"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  Gavel,
  MapPin,
  MapPinned,
  Paperclip,
  Scale,
  Info,
  UserRound,
  Camera,
  Phone,
} from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { ResidentSidebar } from "@/components/resident/sidebar"
import { ResidentNav } from "@/components/ResidentNav"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ImagePreviewGrid } from "@/components/evidence/image-preview-grid"

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

import type { CaseCategory } from "@/lib/types"

const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const LocationPickerMap = dynamic(
  () => import("@/components/resident/location-picker-map").then((module) => module.LocationPickerMap),
  { ssr: false, loading: () => <div aria-label="Loading map" className="h-72 animate-pulse rounded-2xl bg-muted sm:h-96" /> },
)

function manilaDateValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

function previousDateValue(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10)
}

const categories: Array<CaseCategory | "Other"> = [
  "Violence or Threats",
  "Harassment & Abuse",
  "Fraud & Scams",
  "Public Disturbance",
  "Property & Theft",
  "Community Dispute",
  "Child & Vulnerable Protection",
  "Other",
]

type SelectedEvidence = { file: File; previewUrl: string }

export default function ResidentReportIntakePage() {
  const router = useRouter()
  const { toast } = useToast()
  const initialUser = getAuthUser()

  const [fullName, setFullName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState(initialUser?.email ?? "")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileLoadError, setProfileLoadError] = useState("")
  const [street, setStreet] = useState("")
  const [respondentName, setRespondentName] = useState("")
  const [respondentAddress, setRespondentAddress] = useState("")
  const [incidentLocationMode, setIncidentLocationMode] = useState<"manual" | "map">("manual")
  const [incidentCoordinates, setIncidentCoordinates] = useState<{
    latitude: number
    longitude: number
    accuracy: number | null
  } | null>(null)
  const [isResolvingIncidentAddress, setIsResolvingIncidentAddress] = useState(false)
  const [incidentLocationError, setIncidentLocationError] = useState("")
  const locationRequestRef = useRef<AbortController | null>(null)
  const [incidentDate, setIncidentDate] = useState("")
  const [category, setCategory] =
    useState<CaseCategory | "Other">("Community Dispute")
  const [otherCategory, setOtherCategory] = useState("")
  const [reportType, setReportType] = useState("Resident Report")
  const [details, setDetails] = useState("")
  const [selectedEvidence, setSelectedEvidence] = useState<SelectedEvidence[]>([])
  const evidencePreviewUrlsRef = useRef(new Set<string>())
  const [evidenceError, setEvidenceError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [openGuide, setOpenGuide] = useState(false)

  useEffect(() => {
    return () => locationRequestRef.current?.abort()
  }, [])

  useEffect(() => {
    const previewUrls = evidencePreviewUrlsRef.current
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      previewUrls.clear()
    }
  }, [])

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

    setEmail(user.email)
    const controller = new AbortController()
    fetch(`/api/resident/profile?email=${encodeURIComponent(user.email)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || !result.success || typeof result.data?.fullName !== "string" || !result.data.fullName.trim()) {
          throw new Error(result.message || "Your account name could not be loaded. Refresh the page or contact support.")
        }
        setFullName(result.data.fullName)
        setContact(result.data.phone ?? "")
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setProfileLoadError(error instanceof Error ? error.message : "Your account name could not be loaded.")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingProfile(false)
      })
    return () => controller.abort()
  }, [router])

  const today = manilaDateValue()
  const yesterday = previousDateValue(today)

  const resolveSelectedIncidentLocation = async (coordinates: { latitude: number; longitude: number }) => {
    locationRequestRef.current?.abort()
    const controller = new AbortController()
    locationRequestRef.current = controller
    setIncidentCoordinates({ ...coordinates, accuracy: null })
    setStreet("")
    setIncidentLocationError("")
    setIsResolvingIncidentAddress(true)

    try {
      const response = await fetch("/api/location/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(coordinates),
      })
      const result = await response.json()
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Address lookup could not identify this map location.")
      }
      if (controller.signal.aborted) return
      setStreet([
        result.data.street,
        result.data.barangay && (result.data.barangay === "Other / outside Olongapo" ? result.data.barangay : `Barangay ${result.data.barangay}`),
        result.data.city,
      ].filter(Boolean).join(", "))
      setIncidentCoordinates({
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        accuracy: result.data.accuracy ?? null,
      })
    } catch (error) {
      if (!controller.signal.aborted) {
        setIncidentLocationError(error instanceof Error
          ? `${error.message} The pin is saved; enter the address manually below.`
          : "The pin is saved; enter the address manually below.")
      }
    } finally {
      if (!controller.signal.aborted) setIsResolvingIncidentAddress(false)
    }
  }

  const handleEvidenceSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const accepted: File[] = []
    const rejected: string[] = []

    for (const file of Array.from(event.currentTarget.files ?? [])) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        rejected.push(`${file.name}: choose a JPG, PNG, WEBP, or GIF image.`)
      } else if (file.size === 0 || file.size > MAX_EVIDENCE_FILE_SIZE) {
        rejected.push(`${file.name}: each image must be greater than 0 bytes and no larger than 5 MB.`)
      } else {
        accepted.push(file)
      }
    }

    if (accepted.length) {
      const selected = accepted.map((file) => {
        const previewUrl = URL.createObjectURL(file)
        evidencePreviewUrlsRef.current.add(previewUrl)
        return { file, previewUrl }
      })
      setSelectedEvidence((current) => [...current, ...selected])
    }
    setEvidenceError(rejected.join(" "))
    event.currentTarget.value = ""
  }

  const removeSelectedEvidence = (index: number) => {
    const removed = selectedEvidence[index]
    if (!removed) return
    URL.revokeObjectURL(removed.previewUrl)
    evidencePreviewUrlsRef.current.delete(removed.previewUrl)
    setSelectedEvidence((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isLoadingProfile || !fullName.trim()) {
      toast({ title: "Account name unavailable", description: profileLoadError || "Your account name must load before filing a report.", variant: "destructive" })
      return
    }

    if (!contact || !street || !respondentName.trim() || !respondentAddress.trim() || !incidentDate || !reportType.trim() || !details || (category === "Other" && !otherCategory.trim())) {
      toast({
        title: "Missing details",
        description:
          "Please complete all required report details.",
      })
      return
    }

    setIsSubmitting(true)

    let created: { id: string } | null = null
    let submissionError = ""

    try {
      const formData = new FormData()
      const reportFields: Record<string, string> = {
        fullName,
        respondentName,
        respondentAddress,
        category,
        otherCategory: category === "Other" ? otherCategory.trim() : "",
        type: reportType,
        incidentDate,
        contact,
        email,
        street,
        incidentLocation: street,
        details,
      }
      if (incidentCoordinates) {
        reportFields.incidentLatitude = String(incidentCoordinates.latitude)
        reportFields.incidentLongitude = String(incidentCoordinates.longitude)
        if (incidentCoordinates.accuracy != null) reportFields.incidentAccuracy = String(incidentCoordinates.accuracy)
      }
      for (const [key, value] of Object.entries(reportFields)) formData.append(key, value)
      for (const evidence of selectedEvidence) formData.append("evidence", evidence.file, evidence.file.name)

      const response = await fetch("/api/resident/cases", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to save report. Please try again.")
      created = result.data
    } catch (error) {
      submissionError = error instanceof Error ? error.message : "Unable to save report. Please try again."
      created = null
    }

    setIsSubmitting(false)

    if (!created) {
      toast({
        title: "Submission failed",
        description:
          submissionError || "Unable to save report. Please try again.",
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
      <div className="flex min-h-dvh bg-background text-foreground">
        <div className="sticky top-0 hidden h-dvh shrink-0 self-start lg:flex">
          <ResidentSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="hidden lg:block">
              <PageHeader
                title="Submit A Report"
                description="Share what happened, when it happened, and where officers can find it."
                icon={<Gavel className="h-5 w-5 text-white" />}
              />
            </div>

            <div className="mx-auto w-full max-w-5xl space-y-6 pb-24">
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
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                >
                  <Info className="h-4 w-4" />
                  Help Guide
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <span className="rounded-xl bg-primary p-3 text-primary-foreground"><ClipboardList className="h-5 w-5" /></span>
                  <div><p className="text-sm font-semibold">
                    Fill Out Report
                  </p><p className="mt-1 text-xs text-muted-foreground">Describe the incident clearly.</p></div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <span className="rounded-xl bg-muted p-3 text-foreground"><Paperclip className="h-5 w-5" /></span>
                  <div><p className="text-sm font-semibold">
                    Submit Evidence
                  </p><p className="mt-1 text-xs text-muted-foreground">Attach supporting files when asked.</p></div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <span className="rounded-xl bg-muted p-3 text-foreground"><Scale className="h-5 w-5" /></span>
                  <div><p className="text-sm font-semibold">
                    Wait For Hearing
                  </p><p className="mt-1 text-xs text-muted-foreground">Follow status updates in your portal.</p></div>
                </div>
              </div>

              <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-6 sm:px-8">
                  <div className="flex items-start gap-4">
                    <span className="rounded-2xl bg-primary p-3 text-primary-foreground"><FileText className="h-6 w-6" /></span>
                    <div><h1 className="text-2xl font-semibold">
                  Submit A Report
                    </h1>

                      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Provide the incident details and a location officers can verify. Type an address or select a point on the map.
                      </p></div>
                  </div>
                </div>

                <form
                  className="space-y-6 p-5 sm:p-8"
                  onSubmit={handleSubmit}
                >
                  <section className="space-y-4 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <UserRound className="h-5 w-5 text-primary" />
                      <div><h2 className="font-semibold">Your contact details</h2><p className="text-xs text-muted-foreground">Officers may use these details to follow up.</p></div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Complainant Name *
                      </span>

                      {isLoadingProfile ? (
                          <Skeleton aria-label="Loading account name" aria-busy="true" className="h-11 w-full rounded-xl" />
                      ) : (
                        <input
                          value={fullName}
                          readOnly
                          aria-readonly="true"
                          aria-invalid={Boolean(profileLoadError)}
                          className="w-full cursor-not-allowed rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
                        />
                      )}
                      {profileLoadError && <span role="alert" className="block text-xs text-destructive">{profileLoadError}</span>}
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

                      <div className="space-y-2">
                      <input
                        type="date"
                        max={today}
                        value={incidentDate}
                        onChange={(event) =>
                          setIncidentDate(event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={isSubmitting} onClick={() => setIncidentDate(today)} aria-pressed={incidentDate === today} className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors ${incidentDate === today ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
                          <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" />Today
                        </button>
                        <button type="button" disabled={isSubmitting} onClick={() => setIncidentDate(yesterday)} aria-pressed={incidentDate === yesterday} className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors ${incidentDate === yesterday ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
                          Yesterday
                        </button>
                      </div>
                      </div>
                    </label>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <UserRound className="h-5 w-5 text-primary" />
                      <div><h2 className="font-semibold">Respondent details</h2><p className="text-xs text-muted-foreground">Provide the other party’s name and address so the barangay can arrange notice.</p></div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium">Respondent name *</span>
                        <input required value={respondentName} onChange={(event) => setRespondentName(event.target.value)} autoComplete="off" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium">Respondent address *</span>
                        <input required value={respondentAddress} onChange={(event) => setRespondentAddress(event.target.value)} autoComplete="street-address" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                      </label>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border p-5">
                    <div className="flex flex-col gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div><h2 className="font-semibold">Incident location</h2><p className="text-xs text-muted-foreground">Type the address or choose a point on the map. Device location is never requested.</p></div>
                      </div>
                      <div role="group" aria-label="Choose how to enter the incident location" className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => {
                          locationRequestRef.current?.abort()
                          setIncidentLocationMode("manual")
                          setIncidentCoordinates(null)
                          setIncidentLocationError("")
                          setIsResolvingIncidentAddress(false)
                        }} aria-pressed={incidentLocationMode === "manual"} className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold ${incidentLocationMode === "manual" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted"}`}>
                          Type location
                        </button>
                        <button type="button" onClick={() => setIncidentLocationMode("map")} aria-pressed={incidentLocationMode === "map"} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${incidentLocationMode === "map" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted"}`}>
                          <MapPinned className="h-4 w-4" />Choose on map
                        </button>
                      </div>
                    </div>
                    {incidentLocationMode === "map" && <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Click the map to place the pin. Drag the pin to fine-tune the incident location.</p>
                      <LocationPickerMap selectedLocation={incidentCoordinates} onSelectLocation={resolveSelectedIncidentLocation} />
                      {incidentCoordinates && <p className="rounded-xl bg-primary/5 px-3 py-2 text-xs text-muted-foreground">Selected pin: {incidentCoordinates.latitude.toFixed(5)}, {incidentCoordinates.longitude.toFixed(5)}{isResolvingIncidentAddress ? " · Finding the nearby address…" : ""}</p>}
                      {incidentLocationError && <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">{incidentLocationError}</p>}
                    </div>}
                    <div className="grid gap-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium">Incident address *</span>
                        <input required value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Street or landmark, barangay, city" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                      </label>
                    </div>
                    {incidentLocationMode === "map" && <p className="text-xs text-muted-foreground">The map opens at Olongapo City. Address lookup is a suggestion; confirm or edit the full address. If lookup cannot identify the pin, the coordinates remain selected and you can type the address.</p>}
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <Paperclip className="h-5 w-5 text-primary" />
                      <div><h2 className="font-semibold">Submit Evidence</h2><p className="text-xs text-muted-foreground">Attach clear images that support your report. This is optional.</p></div>
                    </div>
                    <label htmlFor="report-evidence" className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-5 text-center transition-colors hover:bg-primary/10">
                      <Camera className="h-6 w-6 text-primary" />
                      <span className="text-sm font-semibold">Choose image files</span>
                      <span className="text-xs text-muted-foreground">JPG, JPEG, PNG, WEBP, or GIF · maximum 5 MB per image</span>
                      <input id="report-evidence" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleEvidenceSelection} disabled={isSubmitting} className="sr-only" />
                    </label>
                    {evidenceError && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{evidenceError}</p>}
                    {selectedEvidence.length > 0 && <ImagePreviewGrid
                      items={selectedEvidence.map(({ file, previewUrl }, index) => ({
                        id: `${file.name}-${file.lastModified}-${index}`,
                        name: file.name,
                        src: previewUrl,
                        details: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                      }))}
                      onRemove={removeSelectedEvidence}
                      disabled={isSubmitting}
                    />}
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="font-semibold">Incident details</h2>
                        <p className="text-xs text-muted-foreground">Select a category and explain what happened.</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        Report Category *
                      </span>

                      <select
                        value={category}
                        onChange={(event) => {
                          setCategory(
                            event.target.value as CaseCategory | "Other"
                          )
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
                    {category === "Other" && <label className="space-y-2">
                      <span className="text-sm font-medium">Specify category *</span>
                      <input required maxLength={80} value={otherCategory} onChange={(event) => setOtherCategory(event.target.value)} placeholder="Enter the case category" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
                    </label>}
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Report type *</span>
                      <input required maxLength={100} value={reportType} onChange={(event) => setReportType(event.target.value)} placeholder="Describe the type of incident" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm" />
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

                  </section>

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
            <div className="flex gap-3 rounded-2xl bg-muted p-4">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-medium">
                Prepare Your Information
              </p>
              <p className="text-sm text-muted-foreground">
                Provide complete names, dates, and
                incident details.
              </p></div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-muted p-4">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-medium">
                Submit Clear Evidence
              </p>
              <p className="text-sm text-muted-foreground">
                Photos and screenshots help validate
                reports.
              </p></div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-muted p-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-medium">
                Stay Reachable
              </p>
              <p className="text-sm text-muted-foreground">
                Barangay officers may contact you.
              </p></div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-muted p-4">
              <Scale className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-medium">
                Attend Hearings
              </p>
              <p className="text-sm text-muted-foreground">
                Both parties may attend mediation.
              </p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
