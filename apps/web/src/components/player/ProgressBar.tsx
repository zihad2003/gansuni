'use client'

import type { ReactNode } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div>
      <div
        ref={trackRef}
        className="relative w-full h-[6px] group cursor-pointer select-none"
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
        <div
          className="absolute inset-y-0 inset-x-0 m-auto rounded-full overflow-hidden"
          style={{
            height: (hovering || seeking) ? '100%' : '70%',
            background: 'rgba(255,255,255,0.18)',
            transition: 'height 150ms ease',
          }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{
              width: `${pct * 100}%`,
              background: seeking || hovering ? accent : '#b3b3b3',
            }}
            transition={{ duration: 0.08, ease: 'linear' }}
          />
          {(hovering || seeking) && (
            <motion.div
              className="absolute inset-y-0 rounded-full pointer-events-none"
              animate={{
                left: 0,
                width: `${Math.max(hoverPct, pct) * 100}%`,
                background: 'rgba(255,255,255,0.12)',
              }}
              transition={{ duration: 0.05 }}
            />
          )}
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none rounded-full shadow-lg"
          animate={{
            left: `calc(${pct * 100}% - 6px)`,
            width: 12,
            height: 12,
            background: '#fff',
            opacity: hovering || seeking ? 1 : 0,
            scale: (hovering || seeking) ? 1 : 0.6,
            boxShadow: `0 0 0 4px ${accent}33`,
          }}
          transition={{ duration: 120 }}
        />

        {(hovering || seeking) && hoverPct > 0 && (
          <motion.div
            className="absolute -top-8 px-2 py-1 rounded-md text-[11px] font-semibold pointer-events-none whitespace-nowrap"
            animate={{
              left: `calc(${hoverPct * 100}%)`,
              x: '-50%',
              background: '#0A0A0A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              opacity: 1,
            }}
            initial={{ opacity: 0, y: 2 }}
            transition={{ duration: 100 }}
          >
            {formatDuration(hoverPct * duration)}
          </motion.div>
        )}
      </div>

      {showLabels && (
        <div className="flex justify-between mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span>{formatDuration(current)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  )
}
