// '2026-04-14' → '14/04'
export const fmtDate = dateStr => `${dateStr.slice(8)}/${dateStr.slice(5, 7)}`

export function getLast7Avg(entries, field) {
  const last7 = entries.slice(-7).filter(e => e[field] != null)
  if (!last7.length) return 0
  return Math.round(last7.reduce((s, e) => s + e[field], 0) / last7.length)
}

export function getWeightAvg7d(entries) {
  const last7 = entries.slice(-7).filter(e => e.weight != null)
  if (!last7.length) {
    const latest = [...entries].reverse().find(e => e.weight != null)
    return latest ? latest.weight : null
  }
  return Math.round((last7.reduce((s, e) => s + e.weight, 0) / last7.length) * 10) / 10
}

export function getGymSessionsThisWeek(entries) {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1
  const mon = new Date(now)
  mon.setDate(now.getDate() - day)
  const monStr = mon.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= monStr && e.gym).length
}

export function getDaysSinceStart(entries) {
  if (!entries.length) return 0
  const start = new Date(entries[0].date)
  const today = new Date()
  return Math.floor((today - start) / (1000 * 60 * 60 * 24))
}

export function getWeeklyGym(entries) {
  const weeks = {}
  entries.forEach(e => {
    const d = new Date(e.date + 'T00:00:00')
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1
    const mon = new Date(d)
    mon.setDate(d.getDate() - day)
    const key = mon.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = 0
    if (e.gym) weeks[key]++
  })
  return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0])).slice(-8)
}
