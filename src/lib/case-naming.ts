function slugWords(value?: string | null) {
  return (value ?? "CASE")
    .replace(/Report\b/i, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word.toUpperCase())
}

export function formatCaseNumber(id: string, date: Date, descriptor?: string | null) {
  const words = slugWords(descriptor)
  const label = words.length ? words.join("-") : "CASE"
  return `IRIS-${date.getFullYear()}-${label}-${id.slice(0, 4).toUpperCase()}`
}
