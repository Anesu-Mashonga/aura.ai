// Utility: fake delay
export const delay = (ms = 400) => new Promise(res => setTimeout(res, ms + Math.random() * 300))

export const ok = (data) => ({ success: true, data })
export const fail = (code, message) => ({ success: false, error: { code, message } })

export const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const safeSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
