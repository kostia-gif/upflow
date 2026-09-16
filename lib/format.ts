export function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" })
}

export function formatDayMonth(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })
}

export function addDays(days: number, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function isValidMobile(v: string) {
  return v.replace(/\D/g, "").length >= 8
}

export function wordCount(v: string) {
  return v.trim() ? v.trim().split(/\s+/).length : 0
}
