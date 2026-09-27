export function paginateItems<T>(items: T[], requestedPage: number, pageSize: number) {
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize))
  const page = Math.min(Math.max(1, Math.floor(requestedPage)), pageCount)

  return {
    page,
    pageCount,
    items: items.slice((page - 1) * safePageSize, page * safePageSize),
  }
}
