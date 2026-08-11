'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SoundWaveProps {
  color?: string
  height?: number
}

export function SoundWave({ color = '#F59E0B', height = 16 }: SoundWaveProps): ReactNode {
  return (
    <div className="flex items-end gap-[2.5px]" style={{ height: `${height}px` }}>
      {[0.4, 0.9, 0.5, 0.8].map((initialScale, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: [`${initialScale * 100}%`, '100%', '25%', `${initialScale * 100}%`],
          }}
          transition={{
            duration: 0.6 + i * 0.15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
