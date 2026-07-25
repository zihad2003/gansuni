import { useState, useCallback, useEffect, useRef } from 'react'
import { FastAverageColor } from 'fast-average-color'
import type { ExtractedColors } from '@gansuni/shared'
import { DEFAULT_FALLBACK_COLORS } from '@gansuni/shared'

const fac = new FastAverageColor()
const IMAGE_CACHE = new Map<string, ExtractedColors>()

interface ExtractionResult {
  extractedColors: ExtractedColors
  sourceImageUrl: string | null
  setSourceImage: (url: string | null) => void
  isLoading: boolean
}

export function useThemeExtraction(): ExtractionResult {
  const [extractedColors, setExtractedColors] = useState<ExtractedColors>(DEFAULT_FALLBACK_COLORS)
  const [sourceImageUrl, setSourceImageUrlState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<number | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const extractFromImage = useCallback(async (url: string): Promise<ExtractedColors | null> => {
    if (!url) return null

    if (IMAGE_CACHE.has(url)) {
      return IMAGE_CACHE.get(url) ?? null
    }

    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.referrerPolicy = 'no-referrer'
      img.src = url
      imgRef.current = img

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          img.onload = null
          img.onerror = null
        }
        img.onload = () => {
          cleanup()
          resolve()
        }
        img.onerror = (e) => {
          cleanup()
          reject(e)
        }
      })

      const avgColor = await fac.getColorAsync(img, {
        algorithm: 'dominant',
        step: 4,
        ignoredColor: [255, 255, 255, 128],
      })

      const avgColor2 = await fac.getColorAsync(img, {
        algorithm: 'simple',
        step: 20,
      })

      const vibrantColor = await fac.getColorAsync(img, {
        algorithm: 'sqrt',
        step: 2,
      })

      const colors: ExtractedColors = {
        dominant: avgColor.hex,
        secondary: avgColor2.hex,
        detail: vibrantColor.hex,
        background: avgColor.hex,
        primary: vibrantColor.hex,
        isDark: avgColor.isDark,
      }

      IMAGE_CACHE.set(url, colors)
      return colors
    } catch (error) {
      console.warn('[Theme] Failed to extract colors:', error)
      return null
    }
  }, [])

  const setSourceImage = useCallback(
    (url: string | null) => {
      if (abortRef.current != null) {
        window.clearTimeout(abortRef.current)
        abortRef.current = null
      }

      setSourceImageUrlState(url)

      if (!url) {
        setExtractedColors(DEFAULT_FALLBACK_COLORS)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const runExtraction = async () => {
        try {
          const colors = await extractFromImage(url)
          if (colors) {
            setExtractedColors(colors)
          }
        } finally {
          setIsLoading(false)
        }
      }

      abortRef.current = window.setTimeout(() => {
        runExtraction()
        abortRef.current = null
      }, 30)
    },
    [extractFromImage],
  )

  useEffect(() => {
    return () => {
      if (abortRef.current != null) {
        window.clearTimeout(abortRef.current)
      }
      if (imgRef.current) {
        imgRef.current.onload = null
        imgRef.current.onerror = null
        imgRef.current = null
      }
      fac.destroy()
    }
  }, [])

  return {
    extractedColors,
    sourceImageUrl,
    setSourceImage,
    isLoading,
  }
}

export function preloadImageColors(urls: string[]): void {
  urls.forEach((url) => {
    if (IMAGE_CACHE.has(url)) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      fac
        .getColorAsync(img, { algorithm: 'dominant', step: 8 })
        .then((avg) => {
          IMAGE_CACHE.set(url, {
            dominant: avg.hex,
            secondary: avg.hex,
            detail: avg.hex,
            background: avg.hex,
            primary: avg.hex,
            isDark: avg.isDark,
          })
        })
        .catch(() => {})
    }
  })
}
