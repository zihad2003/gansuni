'use client'

import type { ReactNode } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VolumeSliderProps {
  volume: number
  onChange: (volume: number) => void
  accent: string
}

export function VolumeSlider({ volume, onChange, accent }: VolumeSliderProps): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [active, setActive] = useState(false)
  const [hoverVol, setHoverVol] = useState(volume)

  const pct = Math.max(0, Math.min(1, volume))
  const displayVol = Math.round((active ? hoverVol : pct) * 100)

  const volFromClientX = useCallback((clientX: number): number => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      setActive(true)
      const v = volFromClientX(e.clientX)
      setHoverVol(v)
      onChange(v)
    },
    [onChange, volFromClientX],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const v = volFromClientX(e.clientX)
      setHoverVol(v)
      if (active) onChange(v)
    },
    [active, onChange, volFromClientX],
  )

  useEffect(() => {
    if (!active) return
    const up = () => setActive(false)
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [active])

  const activePct = active ? hoverVol : pct

  return (
    <div className="relative flex items-center gap-2">
      {/* SOUND WAVE EQUALIZER BARS EFFECT */}
      <div className="flex items-end gap-[2px] h-3 px-1">
        {[0.3, 0.6, 1.0, 0.7].map((heightRatio, i) => {
          const barActive = pct >= heightRatio * 0.7
          return (
            <motion.div
              key={i}
              className="w-[2.5px] rounded-full"
              style={{
                background: barActive ? '#F59E0B' : 'rgba(255,255,255,0.2)',
              }}
              animate={{
                height: barActive ? `${Math.max(4, heightRatio * pct * 12)}px` : '3px',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )
        })}
      </div>

      <div
        ref={trackRef}
        className="relative w-20 sm:w-24 h-4 cursor-pointer select-none flex items-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovering(false)}
        onPointerEnter={() => setHovering(true)}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume * 100)}
        tabIndex={0}
      >
        {/* TRACK BACKGROUND BAR */}
        <div
          className="relative w-full rounded-full overflow-hidden transition-all duration-200"
          style={{
            height: hovering || active ? '6px' : '4px',
            background: 'rgba(255,255,255,0.18)',
          }}
        >
          {/* GRADIENT VOLUME FILL */}
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 100%)',
            }}
            animate={{
              width: `${activePct * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        </div>

        {/* GLOWING THUMB HANDLE */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10 flex items-center justify-center"
          animate={{
            left: `calc(${activePct * 100}% - ${hovering || active ? 7 : 4}px)`,
            width: hovering || active ? 14 : 8,
            height: hovering || active ? 14 : 8,
            scale: active ? 1.2 : hovering ? 1.1 : 1,
            boxShadow: hovering || active
              ? '0 0 12px rgba(245, 158, 11, 0.9)'
              : '0 0 4px rgba(245, 158, 11, 0.4)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="w-full h-full rounded-full bg-white border-2 border-[#F59E0B]" />
        </motion.div>

        {/* VOLUME PERCENTAGE TOOLTIP */}
        <AnimatePresence>
          {(hovering || active) && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.85 }}
              animate={{ opacity: 1, y: -26, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="absolute px-2 py-0.5 rounded-md text-[10px] font-extrabold pointer-events-none whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl z-20"
              style={{
                left: `${activePct * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {displayVol}%
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
