import { CasePriority as DbCasePriority } from "@/generated/prisma/client"
import type { CaseCategory, CasePriority } from "@/lib/types"

export type AiConfig = {
  highPriorityThreshold: string
  criticalPriorityThreshold: string
  autoConfidence: string
}

export type CaseAiAnalysis = {
  category: CaseCategory
  priority: CasePriority
  dbPriority: DbCasePriority
  score: number
  confidence: number
  suggestion: string
  reasons: string[]
  source: "gemini" | "rules"
}

type AnalysisInput = {
  selectedCategory?: CaseCategory
  details: string
  contact?: string
  incidentLocation?: string | null
}

const FALLBACK_AI_CONFIG: AiConfig = {
  highPriorityThreshold: "7.0",
  criticalPriorityThreshold: "9.0",
  autoConfidence: "85",
}

const CATEGORIES: CaseCategory[] = [
  "Violence or Threats",
  "Harassment & Abuse",
  "Fraud & Scams",
  "Public Disturbance",
  "Property & Theft",
  "Community Dispute",
  "Child & Vulnerable Protection",
]

const CATEGORY_KEYWORDS: Record<CaseCategory, string[]> = {
  "Violence or Threats": ["hit", "hurt", "injury", "threat", "attack", "assault", "weapon", "punch", "slap"],
  "Harassment & Abuse": ["harass", "abuse", "stalk", "intimidate", "bully", "verbal", "threaten"],
  "Fraud & Scams": ["scam", "fraud", "money", "loan", "payment", "debt", "transaction", "deceive"],
  "Public Disturbance": ["noise", "drunk", "disturb", "parking", "loud", "street", "curfew", "ordinance"],
  "Property & Theft": ["steal", "theft", "stolen", "damage", "property", "break", "vandal", "robbery"],
  "Community Dispute": ["neighbor", "boundary", "argument", "dispute", "right of way", "canal", "fence"],
  "Child & Vulnerable Protection": ["child", "minor", "elder", "senior", "vawc", "woman", "pregnant", "vulnerable"],
}

const URGENT_KEYWORDS = ["weapon", "knife", "gun", "blood", "hospital", "minor", "child", "vawc", "death", "serious"]
const HIGH_KEYWORDS = ["threat", "injury", "attack", "abuse", "harass", "stalk", "stolen", "robbery"]

function numberSetting(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalize(text: string) {
  return text.toLowerCase()
}

function localAnalyze(input: AnalysisInput, config: AiConfig = FALLBACK_AI_CONFIG): CaseAiAnalysis {
  const text = normalize(`${input.details} ${input.incidentLocation ?? ""}`)
  const scoredCategories = CATEGORIES.map((category) => {
    const matches = CATEGORY_KEYWORDS[category].filter((keyword) => text.includes(keyword)).length
    const selectedBoost = input.selectedCategory === category ? 1 : 0
    return { category, score: matches + selectedBoost }
  }).sort((a, b) => b.score - a.score)

  const best = scoredCategories[0]
  const category = best.score > 0 ? best.category : input.selectedCategory ?? "Community Dispute"
  const urgentHits = URGENT_KEYWORDS.filter((keyword) => text.includes(keyword)).length
  const highHits = HIGH_KEYWORDS.filter((keyword) => text.includes(keyword)).length
  const lengthScore = input.details.length > 350 ? 1 : input.details.length > 150 ? 0.5 : 0
  const categoryScore = category === "Violence or Threats" || category === "Child & Vulnerable Protection"
    ? 2
    : category === "Harassment & Abuse" || category === "Property & Theft"
      ? 1
      : 0
  const score = clamp(3 + urgentHits * 2 + highHits * 1.2 + lengthScore + categoryScore, 1, 10)
  const highThreshold = numberSetting(config.highPriorityThreshold, 7)
  const criticalThreshold = numberSetting(config.criticalPriorityThreshold, 9)
  const dbPriority = score >= criticalThreshold
    ? DbCasePriority.URGENT
    : score >= highThreshold
      ? DbCasePriority.HIGH
      : score >= 5
        ? DbCasePriority.MEDIUM
        : DbCasePriority.LOW

  const priority: CasePriority = dbPriority === DbCasePriority.LOW ? "Low" : dbPriority === DbCasePriority.MEDIUM ? "Medium" : "High"
  const confidence = clamp(60 + best.score * 10 + Math.min(urgentHits + highHits, 3) * 5, 60, 96)
  const reasons = [
    `${category} matched from report wording`,
    `${priority} priority based on risk terms and configured thresholds`,
  ]

  return {
    category,
    priority,
    dbPriority,
    score: Number(score.toFixed(1)),
    confidence,
    suggestion: buildSuggestion(category, priority),
    reasons,
    source: "rules",
  }
}

function buildSuggestion(category: CaseCategory, priority: CasePriority) {
  if (priority === "High") return "Prioritize admin review, verify safety risk, and assign an officer if immediate field support is needed."
  if (category === "Community Dispute") return "Route for barangay review and prepare mediation notes for both parties."
  if (category === "Public Disturbance") return "Check ordinance coverage, validate location details, and assign follow-up if the nuisance is recurring."
  return "Review report details, confirm jurisdiction, and request missing evidence before moving the case forward."
}

function parseAiJson(text: string) {
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? text
  return JSON.parse(jsonText) as Partial<{
    category: CaseCategory
    score: number
    confidence: number
    suggestion: string
    reasons: string[]
  }>
}

async function geminiAnalyze(input: AnalysisInput, config: AiConfig): Promise<CaseAiAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) return null

  try {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "Classify barangay incident reports for IRIS. Return only JSON." }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  allowedCategories: CATEGORIES,
                  selectedCategory: input.selectedCategory,
                  details: input.details,
                  incidentLocation: input.incidentLocation,
                  expectedJson: {
                    category: "one allowed category",
                    score: "number 1-10",
                    confidence: "number 0-100",
                    suggestion: "one practical admin action sentence",
                    reasons: ["short reason", "short reason"],
                  },
                }),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) return null

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("")
    if (!content) return null

    const parsed = parseAiJson(content)
    const fallback = localAnalyze(input, config)
    const category = parsed.category && CATEGORIES.includes(parsed.category) ? parsed.category : fallback.category
    const score = clamp(Number(parsed.score) || fallback.score, 1, 10)
    const highThreshold = numberSetting(config.highPriorityThreshold, 7)
    const criticalThreshold = numberSetting(config.criticalPriorityThreshold, 9)
    const dbPriority = score >= criticalThreshold
      ? DbCasePriority.URGENT
      : score >= highThreshold
        ? DbCasePriority.HIGH
        : score >= 5
          ? DbCasePriority.MEDIUM
          : DbCasePriority.LOW

    return {
      category,
      priority: dbPriority === DbCasePriority.LOW ? "Low" : dbPriority === DbCasePriority.MEDIUM ? "Medium" : "High",
      dbPriority,
      score: Number(score.toFixed(1)),
      confidence: clamp(Number(parsed.confidence) || fallback.confidence, 0, 100),
      suggestion: parsed.suggestion?.trim() || fallback.suggestion,
      reasons: parsed.reasons?.filter(Boolean).slice(0, 3) || fallback.reasons,
      source: "gemini",
    }
  } catch {
    return null
  }
}

export async function analyzeResidentReport(input: AnalysisInput, config: AiConfig = FALLBACK_AI_CONFIG) {
  return (await geminiAnalyze(input, config)) ?? localAnalyze(input, config)
}

export function analyzeStoredCase(input: AnalysisInput) {
  return localAnalyze(input)
}
