function getBaseUrl() {
  if (__DEV__) {
    return 'http://192.168.0.114:3000'
  }
  return 'https://api.yourdomain.com'
}

const BASE_URL = getBaseUrl()

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status} ${path}`)
  return res.json()
}

export const api = {
  getEntries: () => request('/entries'),
  upsertEntry: (date, data) => request(`/entries/${date}`, { method: 'PUT', body: JSON.stringify(data) }),
}
