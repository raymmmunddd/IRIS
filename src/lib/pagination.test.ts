import assert from "node:assert/strict"
import test from "node:test"
import { paginateItems } from "@/lib/pagination"

test("pagination handles an empty list", () => {
  assert.deepEqual(paginateItems([], 1, 5), { page: 1, pageCount: 1, items: [] })
})

test("pagination keeps exactly one page of five items", () => {
  const items = [1, 2, 3, 4, 5]
  assert.deepEqual(paginateItems(items, 1, 5), { page: 1, pageCount: 1, items })
})

test("pagination shows a short last page and clamps stale page numbers", () => {
  assert.deepEqual(paginateItems([1, 2, 3, 4, 5, 6, 7], 2, 5), {
    page: 2,
    pageCount: 2,
    items: [6, 7],
  })
  assert.deepEqual(paginateItems([1, 2], 4, 5), { page: 1, pageCount: 1, items: [1, 2] })
})
