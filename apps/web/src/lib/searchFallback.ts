import { EXPANDED_TRACKS, type Track } from '@gansuni/shared'

const CACHE_KEY = 'gansuni-search-cache'

export function catalogSearch(query: string): Track[] {
  const q = query.trim().toLowerCase()
  if (!q || q === 'trending music songs') return [...EXPANDED_TRACKS]
  return EXPANDED_TRACKS.filter((track) => {
    const haystack = `${track.title} ${track.artist?.name || ''} ${track.album?.title || ''}`.toLowerCase()
    return haystack.includes(q)
  })
}

export function readCachedSearch(query: string): Track[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const hit = all[query.trim().toLowerCase()]
    return Array.isArray(hit) ? hit : []
  } catch {
    return []
  }
}

export function writeCachedSearch(query: string, tracks: Track[]) {
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const keys = Object.keys(all)
    if (keys.length > 24) delete all[keys[0]!]
    all[query.trim().toLowerCase()] = tracks.slice(0, 25)
    localStorage.setItem(CACHE_KEY, JSON.stringify(all))
  } catch {}
}

export function withSearchFallback(query: string, remote: Track[] | null | undefined): { tracks: Track[]; source: 'live' | 'cache' | 'catalog' } {
  if (remote && remote.length > 0) {
    writeCachedSearch(query, remote)
    return { tracks: remote, source: 'live' }
  }
  const cached = readCachedSearch(query)
  if (cached.length > 0) return { tracks: cached, source: 'cache' }
  const catalog = catalogSearch(query)
  if (catalog.length > 0) return { tracks: catalog, source: 'catalog' }
  return { tracks: [...EXPANDED_TRACKS], source: 'catalog' }
}
