import React, { useCallback } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { Image } from 'expo-image'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'
import {
  useCurrentTrack,
  useIsPlaying,
  usePlaybackProgress,
  useMobilePlayer,
} from '@/store/useMobilePlayer'
import { GlassCard } from '../GlassCard'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface MiniPlayerProps {
  onPress?: () => void
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const track = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const { pct } = usePlaybackProgress()
  const { themeColors } = useTheme()

  const togglePlay = useMobilePlayer((s) => s.togglePlay)
  const next = useMobilePlayer((s) => s.next)
  const prev = useMobilePlayer((s) => s.previous)

  const onToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    togglePlay()
  }, [togglePlay])

  const onNext = useCallback(() => {
    Haptics.selectionAsync()
    next()
  }, [next])

  const onPrev = useCallback(() => {
    Haptics.selectionAsync()
    prev()
  }, [prev])

  const scaleAnim = useCallback((pressed: boolean) => {
    'worklet'
    return withTiming(pressed ? 0.97 : 1, { duration: 120 })
  }, [])

  const cover = track?.album?.coverArtUrl ?? null

  return (
    <AnimatedPressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        useAnimatedStyle(() => ({
          transform: [{ scale: scaleAnim(pressed) }],
        }))(),
      ]}
    >
      <GlassCard
        variant="strong"
        style={[
          styles.card,
          {
            borderColor: themeColors.surfaceBorder,
            shadowColor: themeColors.dominant,
            shadowOpacity: 0.35,
            shadowRadius: 22,
          },
        ]}
      >
        <View style={[styles.progressWrap, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, pct * 100)}%`,
                backgroundColor: themeColors.accent,
              },
            ]}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.coverWrap}>
            {cover ? (
              <Image
                source={{ uri: cover }}
                style={styles.cover}
                contentFit="cover"
                transition={400}
              />
            ) : (
              <View style={[styles.cover, { backgroundColor: themeColors.dominant }]} />
            )}
            {isPlaying && <EqualizerBadge accent={themeColors.accent} />}
          </View>

          <View style={styles.metaWrap}>
            <Animated.Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: themeColors.textPrimary },
              ]}
            >
              {track?.title ?? 'Gansuni'}
            </Animated.Text>
            <Animated.Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              {track?.artist?.name ?? 'Premium Bengali Audio'}
            </Animated.Text>
          </View>

          <View style={styles.controls}>
            <ControlButton onPress={onPrev} theme={themeColors} hitSlop={12}>
              <SkipBack size={20} color={themeColors.textPrimary} fill={themeColors.textPrimary} />
            </ControlButton>
            <PlayButton
              isPlaying={isPlaying}
              onPress={onToggle}
              accent={themeColors.accent}
            />
            <ControlButton onPress={onNext} theme={themeColors} hitSlop={12}>
              <SkipForward size={20} color={themeColors.textPrimary} fill={themeColors.textPrimary} />
            </ControlButton>
          </View>
        </View>
      </GlassCard>
    </AnimatedPressable>
  )
}

function ControlButton({
  onPress,
  children,
  hitSlop,
}: {
  onPress: () => void
  children: React.ReactNode
  theme: { textSecondary: string }
  hitSlop?: number
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ctrlBtn,
        { opacity: pressed ? 0.55 : 1 },
      ]}
      hitSlop={hitSlop ? { top: hitSlop, right: hitSlop, bottom: hitSlop, left: hitSlop } : undefined}
    >
      {children}
    </Pressable>
  )
}

function PlayButton({
  isPlaying,
  onPress,
  accent,
}: {
  isPlaying: boolean
  onPress: () => void
  accent: string
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.playBtn,
        {
          backgroundColor: '#1DB954',
          transform: [{ scale: pressed ? 0.93 : 1 }],
          shadowColor: '#1DB954',
        },
      ]}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
    >
      {isPlaying ? (
        <Pause size={20} color="#000" fill="#000" />
      ) : (
        <Play size={20} color="#000" fill="#000" style={{ marginLeft: 2 }} />
      )}
    </Pressable>
  )
}

function EqualizerBadge({ accent }: { accent: string }) {
  return (
    <View style={[styles.eqWrap, { backgroundColor: '#1DB954' }]}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.eqBar,
            {
              backgroundColor: '#000',
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 78,
    zIndex: 10,
  },
  card: {
    overflow: 'hidden',
  },
  progressWrap: {
    height: 2.5,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  coverWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  metaWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  playBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  eqWrap: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    paddingHorizontal: 3,
  },
  eqBar: {
    width: 2,
    height: 7,
    borderRadius: 1,
  },
})
