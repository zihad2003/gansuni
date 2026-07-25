import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import {
  DEFAULT_FALLBACK_COLORS,
  DEFAULT_THEME_COLORS,
  buildThemeColors,
  type ExtractedColors,
  type ThemeColors,
} from '@gansuni/shared'
import { extractAlbumColors, type ExtractionResult } from '@/lib/colors/mobileColorExtractor'

interface ThemeContextValue {
  extractedColors: ExtractedColors
  themeColors: ThemeColors
  setSourceImage: (imageUri: string | null) => void
  currentImageUri: string | null
  isLoading: boolean
  lastResult: ExtractionResult | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialColors?: Partial<ExtractedColors>
  initialSourceImage?: string | null
}

export function ThemeProvider({
  children,
  initialColors,
  initialSourceImage = null,
}: ThemeProviderProps) {
  const [extractedColors, setExtractedColors] = useState<ExtractedColors>(
    useMemo(() => ({ ...DEFAULT_FALLBACK_COLORS, ...(initialColors || {}) }), [initialColors]),
  )
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(initialSourceImage)
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<ExtractionResult | null>(null)
  const [lastProcessedUri, setLastProcessedUri] = useState<string | null>(null)

  const mergedExtracted: ExtractedColors = useMemo(
    () => ({
      ...DEFAULT_FALLBACK_COLORS,
      ...initialColors,
      ...extractedColors,
    }),
    [extractedColors, initialColors],
  )

  const themeColors = useMemo<ThemeColors>(() => buildThemeColors(mergedExtracted), [mergedExtracted])

  useEffect(() => {
    if (!currentImageUri) {
      setExtractedColors({ ...DEFAULT_FALLBACK_COLORS, ...(initialColors || {}) })
      setIsLoading(false)
      setLastResult(null)
      setLastProcessedUri(null)
      return
    }

    if (currentImageUri === lastProcessedUri) return

    let cancelled = false
    setIsLoading(true)
    setLastProcessedUri(currentImageUri)

    extractAlbumColors(currentImageUri, { quality: 'high' })
      .then((result) => {
        if (cancelled) return
        setExtractedColors(result.colors)
        setLastResult(result)
      })
      .catch(() => {
        if (!cancelled) {
          setExtractedColors({ ...DEFAULT_FALLBACK_COLORS, ...(initialColors || {}) })
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentImageUri, initialColors, lastProcessedUri])

  useEffect(() => {
    const handler = (next: AppStateStatus) => {
      if (next === 'active' && currentImageUri) {
        setLastProcessedUri(null)
      }
    }
    const sub = AppState.addEventListener('change', handler)
    return () => sub.remove()
  }, [currentImageUri])

  const value: ThemeContextValue = {
    extractedColors: mergedExtracted,
    themeColors,
    setSourceImage: setCurrentImageUri,
    currentImageUri,
    isLoading,
    lastResult,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { DEFAULT_THEME_COLORS }
