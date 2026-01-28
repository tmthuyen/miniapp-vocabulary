export function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString()
}


