'use client'

import type { ReactNode } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDuration } from '@gansuni/shared'
import type { Milliseconds } from '@gansuni/shared'

interface ProgressBarProps {
  current: Milliseconds
  duration: Milliseconds
  onSeek: (time: Milliseconds) => void
  accent: string
  showLabels?: boolean
}

export function ProgressBar({
  current,
  duration,
  onSeek,
  accent,
  showLabels = false,
}: ProgressBarProps): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [hoverPct, setHoverPct] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const pct = duration > 0 ? Math.min(1, current / duration) : 0

  const pctFromClientX = useCallback((clientX: number): number => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      setSeeking(true)
      const p = pctFromClientX(e.clientX)
      setHoverPct(p)
      onSeek(p * duration)
    },
    [duration, onSeek, pctFromClientX],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = pctFromClientX(e.clientX)
      setHoverPct(p)
      if (seeking) {
        onSeek(p * duration)
      }
    },
    [seeking, duration, onSeek, pctFromClientX],
  )

  const handlePointerUp = useCallback(() => {
    setSeeking(false)
  }, [])

  useEffect(() => {
    if (!seeking) return
    const up = () => setSeeking(false)
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [seeking])

  const activePct = seeking ? hoverPct : pct

  return (
    <div className="w-full">
      <div
        ref={trackRef}
        className="relative w-full h-4 group cursor-pointer select-none flex items-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHovering(false)
          if (!seeking) setHoverPct(0)
        }}
        onPointerEnter={() => setHovering(true)}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration / 1000)}
        aria-valuenow={Math.round(current / 1000)}
        tabIndex={0}
      >
        {/* TRACK BACKGROUND BAR */}
        <div
          className="relative w-full rounded-full overflow-hidden transition-all duration-200"
          style={{
            height: hovering || seeking ? '8px' : '5px',
            background: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* HOVER PREVIEW INDICATOR */}
          {hovering && !seeking && (
            <div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-all duration-75"
              style={{ width: `${hoverPct * 100}%` }}
            />
          )}

          {/* ACTIVE ANIMATED GRADIENT PROGRESS FILL */}
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 50%, #EC4899 100%)',
            }}
            animate={{
              width: `${activePct * 100}%`,
            }}
            transition={{ duration: seeking ? 0 : 0.12, ease: 'linear' }}
          >
            {/* GLOWING SHIMMER LIGHT ON PLAY LINE */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          </motion.div>
        </div>

        {/* GLOWING ANIMATED SEEK HANDLE THUMB */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10 flex items-center justify-center"
          animate={{
            left: `calc(${activePct * 100}% - ${hovering || seeking ? 8 : 5}px)`,
            width: hovering || seeking ? 16 : 10,
            height: hovering || seeking ? 16 : 10,
            scale: seeking ? 1.25 : hovering ? 1.1 : 1,
            boxShadow: hovering || seeking
              ? '0 0 16px rgba(245, 158, 11, 0.9), 0 0 8px rgba(249, 115, 22, 0.8)'
              : '0 0 6px rgba(245, 158, 11, 0.4)',
          }}
          transition={{ duration: seeking ? 0 : 0.12, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-white border-2 border-[#F59E0B]" />
        </motion.div>

        {/* FLOATING SEEK TOOLTIP BADGE */}
        <AnimatePresence>
          {(hovering || seeking) && hoverPct > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.85 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="absolute px-2.5 py-1 rounded-lg text-[11px] font-bold pointer-events-none whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl z-20"
              style={{
                left: `${hoverPct * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {formatDuration(hoverPct * duration)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabels && (
        <div className="flex justify-between mt-1 text-[11px] font-semibold text-white/60">
          <span>{formatDuration(current)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  )
}
