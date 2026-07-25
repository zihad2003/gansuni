import React, { useMemo } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/providers/ThemeProvider'

const DURATION_1 = 18000
const DURATION_2 = 22000
const DURATION_3 = 26000

export function AmbientBackground() {
  const { themeColors } = useTheme()

  const t1 = useSharedValue(0)
  const t2 = useSharedValue(0)
  const t3 = useSharedValue(0)

  React.useEffect(() => {
    t1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: DURATION_1 / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: DURATION_1 / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    )
    t2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: DURATION_2 / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: DURATION_2 / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    )
    t3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: DURATION_3 / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: DURATION_3 / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    )
  }, [t1, t2, t3])

  const blob1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t1.value, [0, 1], [0, 50]) },
      { translateY: interpolate(t1.value, [0, 1], [0, 30]) },
      { scale: interpolate(t1.value, [0, 1], [1, 1.08], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(t1.value, [0, 1], [0.45, 0.6]),
  }))

  const blob2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t2.value, [0, 1], [0, -40]) },
      { translateY: interpolate(t2.value, [0, 1], [0, -20]) },
      { scale: interpolate(t2.value, [0, 1], [1, 1.12], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(t2.value, [0, 1], [0.35, 0.5]),
  }))

  const blob3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t3.value, [0, 1], [0, -30]) },
      { translateY: interpolate(t3.value, [0, 1], [0, 40]) },
      { scale: interpolate(t3.value, [0, 1], [1, 1.18], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(t3.value, [0, 1], [0.25, 0.4]),
  }))

  const gradientColors = useMemo(
    () => [themeColors.gradientFrom, themeColors.gradientVia, themeColors.gradientTo],
    [themeColors.gradientFrom, themeColors.gradientVia, themeColors.gradientTo],
  )

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.blob,
          styles.blob1,
          blob1,
          {
            backgroundColor: themeColors.glowColor.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
              const parts = inner.split(',').map((p: string) => p.trim())
              return `rgba(${parts.slice(0, 3).join(',')}, 0.5)`
            }),
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blob,
          styles.blob2,
          blob2,
          {
            backgroundColor: themeColors.dominant,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blob,
          styles.blob3,
          blob3,
          {
            backgroundColor: themeColors.secondary,
          },
        ]}
      />

      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0,0,0,0)',
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blob1: {
    top: '-15%',
    left: '-10%',
    width: '75%',
    aspectRatio: 1,
    opacity: 0.45,
  },
  blob2: {
    bottom: '-20%',
    right: '-15%',
    width: '70%',
    aspectRatio: 1,
    opacity: 0.35,
  },
  blob3: {
    top: '30%',
    right: '20%',
    width: '45%',
    aspectRatio: 1,
    opacity: 0.25,
  },
})
