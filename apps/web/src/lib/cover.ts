export const COVER_FALLBACK =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'

export function coverSrc(url?: string | null): string {
  if (url && url.trim().length > 0) return url
  return COVER_FALLBACK
}
