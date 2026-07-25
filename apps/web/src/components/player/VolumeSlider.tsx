'use client'

import type { ReactNode } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

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
      onChange(volFromClientX(e.clientX))
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

  return (
    <div
      ref={trackRef}
      className="relative w-full min-w-[80px] h-[14px] cursor-pointer select-none flex items-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setHovering(false)
      }}
      onPointerEnter={() => {
        setHovering(true)
      }}
      role="slider"
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(volume * 100)}
      tabIndex={0}
    >
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: (hovering || active) ? '5px' : '4px',
          background: 'rgba(255,255,255,0.25)',
          transition: 'height 120ms ease',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${pct * 100}%`,
            background: (hovering || active) ? accent : '#b3b3b3',
          }}
          transition={{ duration: 0.08 }}
        />
      </div>
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          left: `calc(${pct * 100}% - 5px)`,
          width: 10,
          height: 10,
          background: '#fff',
          opacity: (hovering || active) ? 1 : 0,
          scale: (hovering || active) ? 1 : 0.5,
        }}
        transition={{ duration: 100 }}
      />
    </div>
  )
}
