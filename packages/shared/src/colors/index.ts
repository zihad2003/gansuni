// =============================================
// DYNAMIC COLOR SYSTEM — Apple Music-style ambient theming
// =============================================

export interface ExtractedColors {
  dominant: string
  secondary: string
  detail: string
  background: string
  primary: string
  isDark: boolean
}

export interface ThemeColors extends ExtractedColors {
  gradientFrom: string
  gradientTo: string
  gradientVia: string
  glowColor: string
  surfaceBg: string
  surfaceBorder: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentHover: string
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  )
}

export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(0,0,0,${alpha})`
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

export function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount,
  )
}

export function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount))
}

export function mixColor(hex1: string, hex2: string, ratio: number): string {
  const r1 = hexToRgb(hex1)
  const r2 = hexToRgb(hex2)
  if (!r1 || !r2) return hex1
  return rgbToHex(
    r1.r * (1 - ratio) + r2.r * ratio,
    r1.g * (1 - ratio) + r2.g * ratio,
    r1.b * (1 - ratio) + r2.b * ratio,
  )
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722
}

export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 0.5
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function getReadableText(bgHex: string): 'dark' | 'light' {
  const darkContrast = contrastRatio(bgHex, '#000000')
  const lightContrast = contrastRatio(bgHex, '#FFFFFF')
  return darkContrast >= lightContrast ? 'dark' : 'light'
}

export function buildThemeColors(extracted: ExtractedColors): ThemeColors {
  const { dominant, secondary, detail, background, isDark } = extracted

  const darkerBg = darkenColor(background || dominant, 0.35)
  const gradientFrom = darkenColor(dominant, 0.55)
  const gradientTo = darkenColor(secondary || dominant, 0.75)
  const gradientVia = mixColor(gradientFrom, gradientTo, 0.5)

  const surfaceAlpha = isDark ? 0.18 : 0.25
  const borderAlpha = isDark ? 0.25 : 0.35
  const surfaceBg = rgba('#FFFFFF', surfaceAlpha)
  const surfaceBorder = rgba('#FFFFFF', borderAlpha)

  const textOnBg = getReadableText(darkerBg)
  const textPrimary = textOnBg === 'dark' ? '#0A0A0A' : '#FFFFFF'
  const textSecondary = rgba(textPrimary, 0.78)
  const textMuted = rgba(textPrimary, 0.55)

  const accent = lightenColor(detail || dominant, 0.15)
  const accentHover = lightenColor(accent, 0.1)

  return {
    ...extracted,
    gradientFrom,
    gradientTo,
    gradientVia,
    glowColor: rgba(dominant, 0.5),
    surfaceBg,
    surfaceBorder,
    textPrimary,
    textSecondary,
    textMuted,
    accent,
    accentHover,
  }
}

export const DEFAULT_FALLBACK_COLORS: ExtractedColors = {
  dominant: '#6D28D9',
  secondary: '#1E1B4B',
  detail: '#A78BFA',
  background: '#0F172A',
  primary: '#7C3AED',
  isDark: true,
}

export const DEFAULT_THEME_COLORS: ThemeColors = buildThemeColors(DEFAULT_FALLBACK_COLORS)
