// =============================================
// SHARED UTILITIES — DOM/Platform agnostic helpers
// =============================================

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, n: number, suffix = '…'): string {
  if (!str) return ''
  return str.length <= n ? str : str.slice(0, Math.max(0, n - suffix.length)) + suffix
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), wait)
  } as T
}

export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
  let lastCall = 0
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    const remaining = limit - (now - lastCall)
    if (remaining <= 0) {
      if (timeout) clearTimeout(timeout)
      timeout = null
      lastCall = now
      fn.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now()
        timeout = null
        fn.apply(this, args)
      }, remaining)
    }
  } as T
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now()
  const d = typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  const diff = Math.abs(now - d)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years}y ago`
  if (months > 0) return `${months}mo ago`
  if (weeks > 0) return `${weeks}w ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export function generateId(prefix = ''): string {
  return (
    prefix +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-4)
  )
}

export function shuffleArray<T>(arr: readonly T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

export function classNamesToTailwindCSSVars(
  colors: Record<string, string>,
  prefix = 'gs',
): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries(colors)) {
    vars[`--${prefix}-${key}`] = value
  }
  return vars
}
