import { prisma } from "@/lib/prisma"

type AiConfig = {
  highPriorityThreshold: string
  criticalPriorityThreshold: string
  autoConfidence: string
}

type RolePermission = {
  role: string
  allowed: string[]
  denied: string[]
}

const DEFAULT_AI_CONFIG: AiConfig = {
  highPriorityThreshold: "7.0",
  criticalPriorityThreshold: "9.0",
  autoConfidence: "85",
}

const DEFAULT_CATEGORIES = [
  "Violence or Threats",
  "Harassment & Bullying",
  "Online & Cyber Issues",
  "Public Disturbance",
  "Property & Damage",
  "Noise Complaint",
  "Environmental Concerns",
  "Community Safety",
  "Others",
]

const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    role: "Admin",
    allowed: ["Full System Access", "User Management", "Edit Settings", "Export Data"],
    denied: [],
  },
  {
    role: "Officer",
    allowed: ["View Cases", "Update Status"],
    denied: ["Delete Cases", "User Management"],
  },
]

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const setting = await prisma.appSetting.findUnique({ where: { key } })
  return (setting?.value as T | undefined) ?? fallback
}

async function writeSetting<T>(key: string, value: T) {
  return prisma.appSetting.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  })
}

export async function getAdminSettingsData() {
  const [aiConfig, categories, permissions] = await Promise.all([
    readSetting("aiConfig", DEFAULT_AI_CONFIG),
    readSetting("categories", DEFAULT_CATEGORIES),
    readSetting("permissions", DEFAULT_PERMISSIONS),
  ])

  return { aiConfig, categories, permissions }
}

export async function saveAdminAiConfigData(aiConfig: AiConfig) {
  await writeSetting("aiConfig", aiConfig)
  return aiConfig
}

export async function saveAdminCategoriesData(categories: string[]) {
  const cleaned = categories.map((item) => item.trim()).filter(Boolean)
  await writeSetting("categories", cleaned)
  return cleaned
}

export async function saveAdminPermissionsData(permissions: RolePermission[]) {
  await writeSetting("permissions", permissions)
  return permissions
}
