import { revalidateTag, unstable_cache } from "next/cache"
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

export type CategorySettings = {
  active: string[]
  archived: string[]
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

function normalizeCategories(value: unknown): CategorySettings {
  const source = Array.isArray(value)
    ? { active: value, archived: [] }
    : value && typeof value === "object"
      ? value as Partial<CategorySettings>
      : { active: [], archived: [] }
  const clean = (items: unknown) => Array.isArray(items)
    ? [...new Set(items.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))]
    : []
  const active = clean(source.active)
  const archived = clean(source.archived).filter((item) => !active.includes(item))
  return { active, archived }
}

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

const getCachedAdminSettingsData = unstable_cache(async () => {
  const [aiConfig, categories, permissions] = await Promise.all([
    readSetting("aiConfig", DEFAULT_AI_CONFIG),
    readSetting("categories", DEFAULT_CATEGORIES),
    readSetting("permissions", DEFAULT_PERMISSIONS),
  ])

  return { aiConfig, categories: normalizeCategories(categories), permissions }
}, ["admin-settings"], { revalidate: 300, tags: ["admin-settings"] })

export async function getAdminSettingsData() {
  return getCachedAdminSettingsData()
}

export async function saveAdminAiConfigData(aiConfig: AiConfig) {
  await writeSetting("aiConfig", aiConfig)
  revalidateTag("admin-settings", "max")
  return aiConfig
}

export async function saveAdminCategoriesData(categories: unknown) {
  const normalized = normalizeCategories(categories)
  await writeSetting("categories", normalized)
  revalidateTag("admin-settings", "max")
  return normalized
}

export async function saveAdminPermissionsData(permissions: RolePermission[]) {
  await writeSetting("permissions", permissions)
  revalidateTag("admin-settings", "max")
  return permissions
}
