"use client";

const brand = [
  { name: "Primary", value: "#1E4FA3", note: "Buttons, emphasis" },
  { name: "Primary Hover", value: "#173E82", note: "Button hover" },
  { name: "Primary Light", value: "#E8F0FF", note: "Sidebar active / subtle fills" },
  { name: "Secondary", value: "#F2B705", note: "Highlights, comparison accents" },
  { name: "Secondary Hover", value: "#D99E04", note: "Secondary hover" },
  { name: "Secondary Light", value: "#FFF6D6", note: "Soft backgrounds" },
  { name: "Tertiary", value: "#D64545", note: "Alerts / destructive" },
  { name: "Tertiary Hover", value: "#B73737", note: "Alert hover" },
  { name: "Tertiary Light", value: "#FDEAEA", note: "Alert backgrounds" },
];

const neutrals = [
  { name: "Background", value: "#F6F8FB", note: "Page background" },
  { name: "Card Background", value: "#FFFFFF", note: "Cards, surfaces" },
  { name: "Border", value: "#E3E8EF", note: "Dividers, outlines" },
  { name: "Text Primary", value: "#1F2937", note: "Headings, body" },
  { name: "Text Secondary", value: "#6B7280", note: "Supporting text" },
];

const sidebar = [
  { name: "Sidebar Background", value: "#1E4FA3", note: "Primary blue" },
  { name: "Active Item", value: "#E8F0FF", note: "Active nav highlight" },
  { name: "Icons", value: "#FFFFFF", note: "Icon color" },
];

const kpis = [
  { name: "Default KPI", value: "#FFFFFF", note: "Standard metric cards" },
  { name: "Urgent KPI", value: "#FDEAEA", note: "Alert tone" },
  { name: "Positive KPI Accent", value: "#F2B705", note: "Gold accent line" },
];

const charts = [
  { name: "Main Dataset", value: "#1E4FA3", note: "Primary series" },
  { name: "Comparison", value: "#F2B705", note: "Secondary series" },
  { name: "Alert Dataset", value: "#D64545", note: "Alert series" },
];

const darkPalette = [
  { name: "Background", value: "#0B1021", note: "Page background" },
  { name: "Surface", value: "#11182E", note: "Cards" },
  { name: "Border", value: "#1E2A46", note: "Dividers" },
  { name: "Text Primary", value: "#E6ECF7", note: "Headings" },
  { name: "Text Secondary", value: "#9BA5B8", note: "Body" },
  { name: "Primary", value: "#4A82FF", note: "Brand accent" },
  { name: "Secondary", value: "#F2B705", note: "Gold accent" },
  { name: "Alert", value: "#D64545", note: "Critical" },
];

function Swatch({ name, value, note }: { name: string; value: string; note?: string }) {
  const isLight = value === "#FFFFFF" || value === "#FFF6D6" || value === "#FDEAEA" || value === "#E8F0FF";
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] bg-white px-3 py-3 shadow-sm">
      <div
        className="h-12 w-12 rounded-md border border-[#E3E8EF]"
        style={{ backgroundColor: value }}
        aria-label={`${name} swatch`}
      />
      <div className="flex flex-col text-left">
        <span className="text-sm font-semibold text-[#1F2937]">{name}</span>
        <span className="text-xs text-[#6B7280]">{value}</span>
        {note ? <span className="text-xs text-[#6B7280]">{note}</span> : null}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: { name: string; value: string; note?: string }[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[#1F2937]">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Swatch key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

export default function ColorGuidePage() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1F2937] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-2 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Design System</p>
          <h1 className="text-4xl font-bold">Color Guidelines</h1>
          <p className="text-base text-[#6B7280]">
            Brand, semantic, sidebar, KPI, and chart colors for IRIS across light and dark modes.
          </p>
        </header>

        <Section title="Brand" items={brand} />
        <Section title="Neutrals" items={neutrals} />
        <Section title="Sidebar" items={sidebar} />
        <Section title="KPI Cards" items={kpis} />
        <Section title="Charts" items={charts} />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1F2937]">Dark Mode (reference)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {darkPalette.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-lg border border-[#1E2A46] bg-[#11182E] px-3 py-3 shadow-sm"
              >
                <div
                  className="h-12 w-12 rounded-md border border-[#1E2A46]"
                  style={{ backgroundColor: item.value }}
                  aria-label={`${item.name} swatch`}
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  <span className="text-xs text-[#9BA5B8]">{item.value}</span>
                  {item.note ? <span className="text-xs text-[#9BA5B8]">{item.note}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
