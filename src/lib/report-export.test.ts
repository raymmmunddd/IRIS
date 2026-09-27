import assert from "node:assert/strict"
import test from "node:test"
import { createReportHtml, createReportCsvRows } from "@/lib/report-export"

test("report exports escape dynamic HTML content and keep sections readable", () => {
  const html = createReportHtml("IRIS <Summary>", [
    { title: "Overview", rows: [["Total cases", 3]] },
    { title: "Status", headers: ["Status", "Cases"], rows: [["<script>", 3]] },
  ])

  assert.match(html, /IRIS &lt;Summary&gt;/)
  assert.match(html, /<h2>Overview<\/h2>/)
  assert.match(html, /<th scope="row">Total cases<\/th><td>3<\/td>/)
  assert.match(html, /&lt;script&gt;/)
  assert.doesNotMatch(html, /<script>/)
})

test("CSV report rows retain the summary, section titles, and values", () => {
  const rows = createReportCsvRows("IRIS Cases", [
    { title: "Overview", rows: [["Total cases", 3]] },
  ])

  assert.deepEqual(rows[0], ["IRIS Cases"])
  assert.deepEqual(rows[2], [])
  assert.deepEqual(rows[3], ["Overview"])
  assert.deepEqual(rows[4], ["Total cases", 3])
})
