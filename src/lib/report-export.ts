import { downloadCsv, type CsvExportValue } from "@/lib/csv-export"

export type ReportExportSection = {
  title: string
  headers?: CsvExportValue[]
  rows: CsvExportValue[][]
}

function escapeHtml(value: CsvExportValue) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character)
}

function generatedAt() {
  return new Date().toLocaleString("en-PH")
}

export function createReportHtml(title: string, sections: ReportExportSection[]) {
  const sectionMarkup = sections.map((section) => {
    const bodyRows = section.rows.map((row) => {
      if (section.headers?.length) return `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
      const [label = "", ...values] = row
      return `<tr><th scope="row">${escapeHtml(label)}</th><td>${values.map(escapeHtml).join(" · ")}</td></tr>`
    }).join("")
    const tableHeader = section.headers?.length
      ? `<thead><tr>${section.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>`
      : ""

    return `<section><h2>${escapeHtml(section.title)}</h2><table>${tableHeader}<tbody>${bodyRows}</tbody></table></section>`
  }).join("")

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font:15px/1.5 Arial,sans-serif;color:#172033;max-width:900px;margin:40px auto;padding:0 24px}h1{margin-bottom:4px;color:#173b75}h2{margin:28px 0 10px;color:#25476f;font-size:18px}p{color:#586579}table{width:100%;border-collapse:collapse;margin:12px 0 24px}th,td{padding:10px 12px;border:1px solid #d7deea;text-align:left;vertical-align:top;white-space:pre-wrap}th{background:#f3f6fb;font-weight:600}td{overflow-wrap:anywhere}@media print{body{margin:0;max-width:none;padding:0}section{break-inside:avoid}h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}</style></head><body><h1>${escapeHtml(title)}</h1><p>Generated ${escapeHtml(generatedAt())}</p>${sectionMarkup}</body></html>`
}

export function createReportCsvRows(title: string, sections: ReportExportSection[]): CsvExportValue[][] {
  return [
    [title],
    ["Generated at", generatedAt()],
    ...sections.flatMap((section) => [
      [],
      [section.title],
      ...(section.headers ? [section.headers] : []),
      ...section.rows,
    ]),
  ]
}

export function downloadHtmlReport(filename: string, title: string, sections: ReportExportSection[]) {
  const url = URL.createObjectURL(new Blob([createReportHtml(title, sections)], { type: "text/html;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadCsvReport(filename: string, title: string, sections: ReportExportSection[]) {
  downloadCsv(filename, createReportCsvRows(title, sections))
}

export function printReportAsPdf(title: string, sections: ReportExportSection[]) {
  const printWindow = window.open("", "_blank", "width=900,height=700")
  if (!printWindow) return false

  printWindow.opener = null
  printWindow.document.open()
  printWindow.document.write(createReportHtml(title, sections))
  printWindow.document.close()
  printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true })
  printWindow.setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 250)
  return true
}
