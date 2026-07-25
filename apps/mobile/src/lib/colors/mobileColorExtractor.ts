import { Cache } from 'react-native-cache'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ImageColors from 'react-native-image-colors'
import type { AndroidImageColors, IOSImageColors, WebImageColors } from 'react-native-image-colors'
import {
  DEFAULT_FALLBACK_COLORS,
  buildThemeColors,
  darkenColor,
  mixColor,
  isDarkColor,
  type ExtractedColors,
  type ThemeColors,
} from '@gansuni/shared'

type PlatformColors = AndroidImageColors | IOSImageColors | WebImageColors

const cache = new Cache({
  namespace: 'gansuni-image-colors',
  policy: {
    maxEntries: 500,
  },
  backend: {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  },
})

export interface ExtractionResult {
  colors: ExtractedColors
  theme: ThemeColors
}

function normalizeColors(result: PlatformColors): ExtractedColors {
  let dominant = DEFAULT_FALLBACK_COLORS.dominant
  let secondary = DEFAULT_FALLBACK_COLORS.secondary
  let detail = DEFAULT_FALLBACK_COLORS.detail
  let background = DEFAULT_FALLBACK_COLORS.background
  let primary = DEFAULT_FALLBACK_COLORS.primary
  let quality = 0

  if ('dominant' in result && result.dominant) {
    dominant = result.dominant
    quality |= 1
  }
  if ('average' in result && result.average) {
    secondary = result.average
    quality |= 2
  }
  if ('vibrant' in result && result.vibrant) {
    detail = result.vibrant
    quality |= 4
    primary = result.vibrant
  }
  if ('darkMuted' in result && result.darkMuted) {
    background = result.darkMuted
    quality |= 8
  }
  if ('darkVibrant' in result && result.darkVibrant) {
    background = result.darkVibrant
  }
  if ('lightMuted' in result && result.lightMuted && !('dominant' in result)) {
    dominant = result.lightMuted
  }
  if ('muted' in result && result.muted && quality < 4) {
    secondary = result.muted
  }
  if ('platform' in result && result.platform === 'android') {
    const a = result as AndroidImageColors
    if (a.dominant) dominant = a.dominant
    if (a.average) secondary = a.average
    if (a.vibrant) detail = a.vibrant
    if (a.darkVibrant) primary = a.darkVibrant
    if (a.darkMuted) background = a.darkMuted
  }

  const isDark = isDarkColor(background || dominant)

  if (quality === 0) {
    return { ...DEFAULT_FALLBACK_COLORS, isDark }
  }

  if (dominant === secondary && detail === dominant) {
    detail = mixColor(dominant, '#FFFFFF', 0.3)
    secondary = darkenColor(dominant, 0.2)
  }
  if (background === dominant) {
    background = darkenColor(dominant, 0.4)
  }

  return {
    dominant,
    secondary,
    detail,
    background,
    primary,
    isDark,
  }
}

export async function extractAlbumColors(
  imageUri: string,
  opts: {
    fallback?: Partial<ExtractedColors>
    cache?: boolean
    quality?: 'lowest' | 'low' | 'high' | 'highest'
  } = {},
): Promise<ExtractionResult> {
  const { fallback = {}, cache: useCache = true, quality = 'high' } = opts

  const cacheKey = `col:${imageUri}:${quality}`
  if (useCache) {
    try {
      const cached = await cache.getItem<ExtractedColors>(cacheKey)
      if (cached) {
        return {
          colors: { ...DEFAULT_FALLBACK_COLORS, ...fallback, ...cached },
          theme: buildThemeColors({ ...DEFAULT_FALLBACK_COLORS, ...fallback, ...cached }),
        }
      }
    } catch {}
  }

  try {
    const result = (await ImageColors.getColors(imageUri, {
      fallback: DEFAULT_FALLBACK_COLORS.dominant,
      quality,
      pixelSpacing: 5,
      key: imageUri,
    })) as PlatformColors

    const extracted = normalizeColors(result)
    const final: ExtractedColors = {
      ...DEFAULT_FALLBACK_COLORS,
      ...fallback,
      ...extracted,
    }

    if (useCache) {
      try {
        await cache.setItem(cacheKey, final, { ttl: 1000 * 60 * 60 * 24 * 30 })
      } catch {}
    }

    return {
      colors: final,
      theme: buildThemeColors(final),
    }
  } catch (error) {
    console.warn('[MobileColors] Extraction failed for', imageUri, error)
    const fallbackColors: ExtractedColors = {
      ...DEFAULT_FALLBACK_COLORS,
      ...fallback,
    }
    return {
      colors: fallbackColors,
      theme: buildThemeColors(fallbackColors),
    }
  }
}

export async function preloadAlbumColors(
  imageUris: string[],
  opts?: Parameters<typeof extractAlbumColors>[1],
): Promise<void> {
  for (const uri of imageUris) {
    extractAlbumColors(uri, opts).catch(() => {})
  }
}

export function clearColorsCache(): Promise<void> {
  return cache.clearAll()
}
