export type CsvExportValue = string | number | boolean | null | undefined

function encodeCsvCell(value: CsvExportValue) {
  const text = String(value ?? "")
  const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function downloadCsv(filename: string, rows: CsvExportValue[][]) {
  if (rows.length === 0) return

  const csv = rows.map((row) => row.map(encodeCsvCell).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
