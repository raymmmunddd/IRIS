export const dynamic = 'force-dynamic'
"use client";

type PaletteItem = { name: string; token: string; fallback?: string; note?: string }

const brand: PaletteItem[] = [
  { name: "Primary", token: "--primary", fallback: "#1E4FA3", note: "Buttons, emphasis" },
  { name: "Primary Hover", token: "--primary-hover", fallback: "#173E82", note: "Button hover" },
  { name: "Primary Light", token: "--primary-light", fallback: "#E8F0FF", note: "Sidebar active / subtle fills" },
  { name: "Secondary", token: "--secondary", fallback: "#F2B705", note: "Highlights, comparison accents" },
  { name: "Secondary Hover", token: "--secondary-hover", fallback: "#D99E04", note: "Secondary hover" },
  { name: "Secondary Light", token: "--secondary-light", fallback: "#FFF6D6", note: "Soft backgrounds" },
  { name: "Tertiary", token: "--tertiary", fallback: "#D64545", note: "Alerts / destructive" },
  { name: "Tertiary Hover", token: "--tertiary-hover", fallback: "#B73737", note: "Alert hover" },
  { name: "Tertiary Light", token: "--tertiary-light", fallback: "#FDEAEA", note: "Alert backgrounds" },
]

const neutrals: PaletteItem[] = [
  { name: "Background", token: "--background", fallback: "#F6F8FB", note: "Page background" },
  { name: "Card Background", token: "--card", fallback: "#FFFFFF", note: "Cards, surfaces" },
  { name: "Border", token: "--border", fallback: "#E3E8EF", note: "Dividers, outlines" },
  { name: "Text Primary", token: "--foreground", fallback: "#1F2937", note: "Headings, body" },
  { name: "Text Secondary", token: "--text-secondary", fallback: "#6B7280", note: "Supporting text" },
]

const sidebar: PaletteItem[] = [
  { name: "Sidebar Background", token: "--sidebar-bg", fallback: "#1E4FA3", note: "Primary blue" },
  { name: "Active Item", token: "--sidebar-active", fallback: "#E8F0FF", note: "Active nav highlight" },
  { name: "Icons", token: "--sidebar-icon", fallback: "#FFFFFF", note: "Icon color" },
]

const kpis: PaletteItem[] = [
  { name: "Default KPI", token: "--kpi-default", fallback: "#FFFFFF", note: "Standard metric cards" },
  { name: "Urgent KPI", token: "--kpi-urgent", fallback: "#FDEAEA", note: "Alert tone" },
  { name: "Positive KPI Accent", token: "--kpi-positive-accent", fallback: "#F2B705", note: "Gold accent line" },
]

const charts: PaletteItem[] = [
  { name: "Main Dataset", token: "--chart-main", fallback: "#1E4FA3", note: "Primary series" },
  { name: "Comparison", token: "--chart-comparison", fallback: "#F2B705", note: "Secondary series" },
  { name: "Alert Dataset", token: "--chart-alert", fallback: "#D64545", note: "Alert series" },
]

function Swatch({ name, token, fallback, note }: PaletteItem) {
  const value = `var(${token}${fallback ? `, ${fallback}` : ""})`

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3 shadow-sm">
      <div
        className="h-12 w-12 rounded-md border border-[var(--border)]"
        style={{ backgroundColor: value }}
        aria-label={`${name} swatch`}
      />
      <div className="flex flex-col text-left">
        <span className="text-sm font-semibold text-[var(--foreground)]">{name}</span>
        <span className="text-xs text-[var(--text-secondary)]">{token}{fallback ? ` (${fallback})` : ""}</span>
        {note ? <span className="text-xs text-[var(--text-secondary)]">{note}</span> : null}
      </div>
    </div>
  )
}

function Section({ title, items }: { title: string; items: PaletteItem[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Swatch key={item.name} {...item} />
        ))}
      </div>
    </section>
  )
}

export default function ColorGuidePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-12 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-2 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Design System</p>
          <h1 className="text-4xl font-bold">Color Guidelines</h1>
          <p className="text-base text-[var(--text-secondary)]">
            Live tokens for brand, semantic, sidebar, KPI, and chart colors. Switch your OS theme to see dark mode.
          </p>
        </header>

        <Section title="Brand" items={brand} />
        <Section title="Neutrals" items={neutrals} />
        <Section title="Sidebar" items={sidebar} />
        <Section title="KPI Cards" items={kpis} />
        <Section title="Charts" items={charts} />

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          These swatches read from CSS variables, so they stay in sync with the dashboard theme and adapt automatically in
          dark mode.
        </div>
      </div>
    </div>
  )
}
