'use client'

import { useEffect, useMemo, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import {
  buildThemeColors,
  DEFAULT_FALLBACK_COLORS,
  DEFAULT_THEME_COLORS,
  type ExtractedColors,
  type ThemeColors,
} from '@gansuni/shared'
import { useThemeExtraction } from '@/lib/colors/webColorExtractor'

interface ThemeContextValue {
  extractedColors: ExtractedColors
  themeColors: ThemeColors
  setSourceImage: (imageUrl: string | null) => void
  currentImageUrl: string | null
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

interface ThemeProviderProps {
  children: ReactNode
  initialColors?: Partial<ExtractedColors>
}

export function ThemeProvider({ children, initialColors }: ThemeProviderProps): ReactNode {
  const {
    extractedColors,
    sourceImageUrl,
    setSourceImage,
    isLoading,
  } = useThemeExtraction()

  const mergedExtracted = useMemo<ExtractedColors>(() => {
    return {
      ...DEFAULT_FALLBACK_COLORS,
      ...initialColors,
      ...extractedColors,
    }
  }, [extractedColors, initialColors])

  const themeColors = useMemo<ThemeColors>(() => {
    return buildThemeColors(mergedExtracted)
  }, [mergedExtracted])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    const cssVars: Record<string, string> = {
      '--gs-dominant': themeColors.dominant,
      '--gs-secondary': themeColors.secondary,
      '--gs-detail': themeColors.detail,
      '--gs-background': themeColors.background,
      '--gs-gradient-from': themeColors.gradientFrom,
      '--gs-gradient-to': themeColors.gradientTo,
      '--gs-gradient-via': themeColors.gradientVia,
      '--gs-glow': themeColors.glowColor,
      '--gs-surface-bg': themeColors.surfaceBg,
      '--gs-surface-border': themeColors.surfaceBorder,
      '--gs-text-primary': themeColors.textPrimary,
      '--gs-text-secondary': themeColors.textSecondary,
      '--gs-text-muted': themeColors.textMuted,
      '--gs-accent': themeColors.accent,
      '--gs-accent-hover': themeColors.accentHover,
    }

    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value)
    }

    root.style.colorScheme = themeColors.isDark ? 'dark' : 'light'
  }, [themeColors])

  const value: ThemeContextValue = {
    extractedColors: mergedExtracted,
    themeColors,
    setSourceImage,
    currentImageUrl: sourceImageUrl,
    isLoading,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { DEFAULT_THEME_COLORS }
