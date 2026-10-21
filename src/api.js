const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const getToken = () => localStorage.getItem('token')
export async function api(path, { method = 'GET', body } = {}) {
  const t = getToken()
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && data?.error?.code === 'TOKEN_EXPIRED') { localStorage.removeItem('token'); window.dispatchEvent(new Event('logout')) }
    const e = new Error(data?.error?.message || 'Something went wrong'); e.details = data?.error?.details; e.status = res.status; throw e
  }
  return data
}
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
export const lakh = (n) => n >= 1e5 ? '₹' + (n / 1e5).toFixed(1) + 'L' : inr(n)
