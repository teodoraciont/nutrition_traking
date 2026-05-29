import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.getEntries()
      .then(setEntries)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const upsertEntry = useCallback(async (date, data) => {
    const updated = await api.upsertEntry(date, data)
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === date)
      return idx >= 0
        ? prev.map((e, i) => i === idx ? updated : e)
        : [...prev, updated].sort((a, b) => a.date.localeCompare(b.date))
    })
    return updated
  }, [])

  return { entries, loading, error, upsertEntry, reload: load }
}
