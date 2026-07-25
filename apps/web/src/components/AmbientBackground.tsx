'use client'

import type { ReactNode } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { motion } from 'framer-motion'

export function AmbientBackground(): ReactNode {
  const { themeColors } = useTheme()

  return (
    <div
      className="ambient-bg theme-transition-all"
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, ${themeColors.gradientFrom} 0%, ${themeColors.gradientVia} 45%, ${themeColors.gradientTo} 100%)`,
      }}
    >
      <motion.div
        className="ambient-blob ambient-blob-1"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${themeColors.glowColor}, transparent 70%)`,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="ambient-blob ambient-blob-2"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${themeColors.dominant}, transparent 70%)`,
        }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      <motion.div
        className="ambient-blob ambient-blob-3"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${themeColors.secondary}, transparent 70%)`,
        }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(255,255,255,0.05), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
