import React, { type ReactNode } from 'react'
import {
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
  Platform,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/providers/ThemeProvider'

export type GlassVariant = 'card' | 'strong' | 'button' | 'sheet'

interface GlassCardProps extends ViewProps {
  variant?: GlassVariant
  intensity?: number
  children?: ReactNode
  style?: ViewStyle
  tint?: 'light' | 'dark' | 'default'
}

export function GlassCard({
  variant = 'card',
  intensity,
  children,
  style,
  tint,
  ...rest
}: GlassCardProps) {
  const { themeColors } = useTheme()

  const variantStyles = getVariantStyles(variant, themeColors)
  const blurTint: 'light' | 'dark' | 'default' = tint ?? (themeColors.isDark ? 'dark' : 'light')
  const blurIntensity = intensity ?? getVariantIntensity(variant)

  return (
    <View
      {...rest}
      style={[
        styles.base,
        variantStyles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderRadius: variantStyles.borderRadius,
        },
        style,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

function getVariantIntensity(variant: GlassVariant): number {
  switch (variant) {
    case 'strong':
      return 35
    case 'button':
      return 15
    case 'sheet':
      return 40
    case 'card':
    default:
      return 25
  }
}

function getVariantStyles(variant: GlassVariant, theme: any) {
  switch (variant) {
    case 'strong':
      return {
        container: styles.strong as ViewStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.20)',
        borderRadius: 32,
      }
    case 'button':
      return {
        container: styles.button as ViewStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderColor: 'rgba(255, 255, 255, 0.22)',
        borderRadius: 9999,
      }
    case 'sheet':
      return {
        container: styles.sheet as ViewStyle,
        backgroundColor: 'rgba(15, 15, 20, 0.55)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 36,
      }
    case 'card':
    default:
      return {
        container: styles.card as ViewStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 28,
      }
  }
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  strong: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -12 },
    elevation: 20,
  },
})
