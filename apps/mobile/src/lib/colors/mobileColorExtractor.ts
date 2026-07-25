import {
  DEFAULT_FALLBACK_COLORS,
  buildThemeColors,
  type ExtractedColors,
  type ThemeColors,
} from '@gansuni/shared'

export interface ExtractionResult {
  colors: ExtractedColors
  theme: ThemeColors
}

export async function extractAlbumColors(
  imageUri: string,
  opts: {
    fallback?: Partial<ExtractedColors>
    cache?: boolean
    quality?: 'lowest' | 'low' | 'high' | 'highest'
  } = {},
): Promise<ExtractionResult> {
  const { fallback = {} } = opts
  const finalColors: ExtractedColors = {
    ...DEFAULT_FALLBACK_COLORS,
    ...fallback,
  }

  return {
    colors: finalColors,
    theme: buildThemeColors(finalColors),
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

export async function clearColorsCache(): Promise<void> {}
