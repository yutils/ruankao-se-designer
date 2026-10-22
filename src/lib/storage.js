const NS = 'se-designer:v1'

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw)
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}

export function loadState() {
  if (typeof localStorage === 'undefined') return null
  try {
    return safeParse(localStorage.getItem(NS), null)
  } catch {
    return null
  }
}

export function saveState(state) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(NS, JSON.stringify(state))
  } catch {
    /* 隐私模式等场景静默失败 */
  }
}

export function clearState() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(NS)
  } catch {
    /* ignore */
  }
}

export { NS }
