import type { CaseCategory } from "@/lib/types"

export type CategoryScopeProfile = {
  title: string
  inScope: string[]
  outOfScope: string[]
  reminders: string[]
}

export type ScopeInput = {
  category: CaseCategory
  incidentCity: string
  respondentWithinBarangay: boolean
  respondentHomeless: boolean
  estimatedClaimAmount: number | null
  possiblePenaltyOverOneYear: boolean
  coveredByBarangayOrdinance: boolean
  flags: {
    cybercrime: boolean
    defamationOutsideScope: boolean
    vehicularAccident: boolean
    humanRightsViolation: boolean
  }
}

export type ScopeEvaluation = {
  allowed: boolean
  blockers: string[]
  notices: string[]
  referrals: string[]
}

export const CATEGORY_SCOPE_RULES: Record<CaseCategory, CategoryScopeProfile> = {
  "Violence or Threats": {
    title: "Violence or Threats (Barangay-level)",
    inScope: [
      "Slight physical injuries and threat complaints within barangay jurisdiction.",
      "Neighbor disputes where mediation is still possible through Katarungang Pambarangay.",
    ],
    outOfScope: [
      "Serious crimes punishable by more than 1 year imprisonment.",
      "Human rights violations requiring direct law enforcement or court action.",
    ],
    reminders: [
      "If violence escalates or there is immediate danger, contact police first.",
    ],
  },
  "Harassment & Abuse": {
    title: "Harassment & Abuse",
    inScope: [
      "Local verbal harassment and repeated nuisance behavior between barangay constituents.",
      "Disputes that can undergo mediation and conciliation hearings.",
    ],
    outOfScope: [
      "Cyber harassment and online defamation outside barangay jurisdiction.",
      "Cases involving severe criminal penalties requiring direct filing in court.",
    ],
    reminders: [
      "Document dates, witnesses, and any threats for hearing records.",
    ],
  },
  "Fraud & Scams": {
    title: "Fraud & Scams",
    inScope: [
      "Local barangay-level monetary disputes where both parties are within jurisdiction.",
      "Disputes that remain within mediation and settlement coverage.",
    ],
    outOfScope: [
      "Cybercrime and online scam operations handled by police cybercrime units.",
      "Claims over PHP 1,000,000 requiring direct filing in court.",
    ],
    reminders: [
      "Prepare transaction proofs for validation during hearings.",
    ],
  },
  "Public Disturbance": {
    title: "Public Disturbance",
    inScope: [
      "Noise complaints, nuisance, and local ordinance enforcement (example: load clearing and parking rules).",
      "Complaints involving barangay constituents within covered streets and public areas.",
    ],
    outOfScope: [
      "Vehicular accidents requiring police and DILG handling.",
      "Complaints outside barangay ordinance coverage.",
    ],
    reminders: [
      "Use ordinance references where possible for faster action.",
    ],
  },
  "Property & Theft": {
    title: "Property & Theft",
    inScope: [
      "Minor property damage and local disputes that can be mediated.",
      "Cases where parties are within barangay jurisdiction and settlement is possible.",
    ],
    outOfScope: [
      "Major theft/robbery and crimes punishable beyond barangay mediation scope.",
      "High-value claims above PHP 1,000,000 for direct court filing.",
    ],
    reminders: [
      "Attach photos and incident evidence for blotter documentation.",
    ],
  },
  "Community Dispute": {
    title: "Community Dispute",
    inScope: [
      "Boundary, nuisance, canal/pathway, and neighborhood disputes between barangay constituents.",
      "Conciliation matters under Katarungang Pambarangay process.",
    ],
    outOfScope: [
      "Disputes involving parties outside Olongapo or outside barangay jurisdiction.",
      "Disputes without legal/ordinance basis that barangay cannot act on.",
    ],
    reminders: [
      "Both complainant and respondent should attend hearings for mediation to proceed.",
    ],
  },
  "Child & Vulnerable Protection": {
    title: "Child & Vulnerable Protection",
    inScope: [
      "VAWC and vulnerable-person complaints where barangay intervention and referral are required.",
      "Cases that need immediate protection coordination while mediation/legal steps are assessed.",
    ],
    outOfScope: [
      "Severe abuse or criminal cases requiring direct police, court, and social welfare action.",
      "Human rights violations outside barangay-only resolution scope.",
    ],
    reminders: [
      "Report urgent child or vulnerable-person danger immediately to emergency authorities.",
    ],
  },
}

export function evaluateResidentReportScope(input: ScopeInput): ScopeEvaluation {
  const blockers: string[] = []
  const notices: string[] = []
  const referrals: string[] = []

  if (!input.incidentCity.toLowerCase().includes("olongapo")) {
    blockers.push("Reports outside Olongapo are outside barangay scope.")
    referrals.push("Please file with the barangay/LGU where the incident occurred.")
  }

  if (!input.respondentWithinBarangay) {
    blockers.push("Respondent must be within barangay jurisdiction for barangay action.")
    referrals.push("If the respondent is outside the barangay, use direct filing in proper jurisdiction.")
  }

  if (input.respondentHomeless) {
    blockers.push("Homeless-person concerns are outside regular complaint filing scope.")
    referrals.push("Coordinate with social welfare and humanitarian services for intervention.")
  }

  if (!input.coveredByBarangayOrdinance) {
    blockers.push("The matter is not covered by barangay ordinance/law and cannot be acted on here.")
  }

  if (input.possiblePenaltyOverOneYear) {
    blockers.push("Cases punishable by more than 1 year imprisonment are for direct court/police filing.")
    referrals.push("Proceed with police blotter and direct filing in court.")
  }

  if (input.estimatedClaimAmount !== null && input.estimatedClaimAmount > 1_000_000) {
    blockers.push("Claims above PHP 1,000,000 are outside barangay conciliation and require direct court filing.")
    referrals.push("Use direct filing in court for high-value claims.")
  }

  if (input.flags.cybercrime) {
    blockers.push("Cybercrime complaints are outside barangay intake scope.")
    referrals.push("File with PNP Anti-Cybercrime Group or proper law enforcement unit.")
  }

  if (input.flags.defamationOutsideScope) {
    blockers.push("Defamation complaint is outside barangay scope in this context.")
    referrals.push("Consult legal counsel for direct filing options.")
  }

  if (input.flags.vehicularAccident) {
    blockers.push("Vehicular accidents must be handled by police/DILG and traffic authorities.")
    referrals.push("Proceed to police for traffic incident documentation.")
  }

  if (input.flags.humanRightsViolation) {
    blockers.push("Human rights violation complaints require direct referral beyond barangay intake.")
    referrals.push("Coordinate with CHR and police for formal action.")
  }

  notices.push("Formal complaint hearing should be set within 5 working days from filing.")
  notices.push("Summons/notice should be sent within 2 days.")
  notices.push("If complainant misses 2 consecutive hearings without valid reason, complaint may be dismissed.")
  notices.push("If unresolved, Lupon conciliation runs for 15 days (extendable), with total case progress within 60 days.")
  notices.push("If settlement is not fulfilled, repudiation/reopening may be requested within 10 days.")

  return {
    allowed: blockers.length === 0,
    blockers,
    notices,
    referrals,
  }
}