import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import {
  useMobilePlayer,
  useCurrentTrack,
  useIsPlaying,
  usePlaybackProgress,
  downloadTrackForOffline,
  isTrackDownloaded,
} from '@/store/useMobilePlayer'
import { GlassCard } from '@/components/GlassCard'
import { formatDuration, formatNumber } from '@gansuni/shared'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Heart,
  Share2,
  Download,
  CheckCircle,
  ListMusic,
  Gauge,
  Maximize2,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import Slider from '@react-native-community/slider'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { router } from 'expo-router'

const { width: SCREEN_W } = Dimensions.get('screen')
const COVER_SIZE = Math.min(SCREEN_W * 0.78, 360)

export default function FullPlayerScreen() {
  const insets = useSafeAreaInsets()
  const { themeColors } = useTheme()
  const track = useCurrentTrack()
  const isPlaying = useIsPlaying()
  const { current, duration, pct } = usePlaybackProgress()

  const togglePlay = useMobilePlayer((s) => s.togglePlay)
  const next = useMobilePlayer((s) => s.next)
  const previous = useMobilePlayer((s) => s.previous)
  const seekTo = useMobilePlayer((s) => s.seekTo)
  const setVolume = useMobilePlayer((s) => s.setVolume)
  const volume = useMobilePlayer((s) => s.volume)
  const muted = useMobilePlayer((s) => s.muted)
  const shuffle = useMobilePlayer((s) => s.shuffle)
  const repeat = useMobilePlayer((s) => s.repeat)
  const speed = useMobilePlayer((s) => s.speed)
  const toggleShuffle = useMobilePlayer((s) => s.toggleShuffle)
  const toggleRepeat = useMobilePlayer((s) => s.toggleRepeat)
  const setSpeed = useMobilePlayer((s) => s.setSpeed)

  const [liked, setLiked] = React.useState(false)
  const [downloaded, setDownloaded] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)
  const [downloadPct, setDownloadPct] = React.useState(0)

  React.useEffect(() => {
    if (track) setDownloaded(isTrackDownloaded(track.id))
  }, [track?.id])

  const cover = track?.album?.coverArtUrl ?? null

  const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  const hapticSel = () => Haptics.selectionAsync()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeColors.gradientFrom }]} pointerEvents="none" />
      <LinearGradient
        colors={[themeColors.gradientFrom, themeColors.gradientVia, themeColors.gradientTo]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => {
            hapticSel()
            router.back()
          }}
          style={({ pressed }) => [
            styles.iconBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={12}
        >
          <ChevronDown size={26} color={themeColors.textPrimary} />
        </Pressable>
        <View style={styles.headerMeta}>
          <Text style={[styles.headerLabel, { color: themeColors.textMuted }]}>
            NOW PLAYING FROM
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.headerAlbum, { color: themeColors.textPrimary }]}
          >
            {track?.album?.title ?? 'Library'}
          </Text>
        </View>
        <Pressable style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]} hitSlop={12}>
          <ListMusic size={22} color={themeColors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.coverContainer}>
          <Animated.View
            style={[
              styles.coverWrap,
              {
                width: COVER_SIZE,
                height: COVER_SIZE,
              },
              useAnimatedStyle(() => ({
                transform: [{ scale: withTiming(isPlaying ? 1 : 0.94, { duration: 350 }) }],
              })),
            ]}
          >
            <GlassCard
              variant="strong"
              intensity={45}
              style={[
                styles.coverCard,
                {
                  shadowColor: themeColors.dominant,
                  shadowOpacity: 0.55,
                  shadowRadius: 50,
                  shadowOffset: { width: 0, height: 28 },
                  elevation: 18,
                },
              ]}
            >
              {cover ? (
                <Image
                  source={{ uri: cover }}
                  style={styles.coverArt}
                  contentFit="cover"
                  transition={600}
                />
              ) : (
                <View style={[styles.coverArt, { backgroundColor: themeColors.dominant }]} />
              )}
            </GlassCard>
          </Animated.View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text
                numberOfLines={2}
                style={[styles.title, { color: themeColors.textPrimary }]}
              >
                {track?.title ?? 'No track playing'}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.artist, { color: themeColors.textSecondary }]}
              >
                {track?.artist?.name ?? ''}
                {track?.album?.artist?.name && !track?.artist?.name
                  ? ` · ${track.album.artist.name}`
                  : ''}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                hapticLight()
                setLiked((v) => !v)
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={10}
            >
              <Heart
                size={24}
                fill={liked ? '#F59E0B' : 'transparent'}
                color={liked ? '#F59E0B' : themeColors.textSecondary}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>

          <View style={styles.sliderWrap}>
            <Slider
              value={Math.min(1, pct)}
              minimumValue={0}
              maximumValue={1}
              onValueChange={(val) => seekTo(val * duration)}
              minimumTrackTintColor={themeColors.accent}
              maximumTrackTintColor="rgba(255,255,255,0.22)"
              thumbTintColor="#fff"
              style={styles.slider}
              tapToSeek
            />
            <View style={styles.timeRow}>
              <Text style={[styles.time, { color: themeColors.textMuted }]}>
                {formatDuration(current)}
              </Text>
              <Text style={[styles.time, { color: themeColors.textMuted }]}>
                {formatDuration(duration)}
              </Text>
            </View>
          </View>

          <View style={styles.mainControls}>
            <Pressable
              onPress={() => {
                hapticSel()
                toggleShuffle()
              }}
              hitSlop={10}
              style={({ pressed }) => [
                styles.mainCtrl,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Shuffle
                size={22}
                color={shuffle ? themeColors.accent : themeColors.textSecondary}
                strokeWidth={shuffle ? 2.4 : 2}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                hapticLight()
                previous()
              }}
              hitSlop={14}
              style={({ pressed }) => [
                styles.mainCtrl,
                { opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
              ]}
            >
              <SkipBack size={34} color={themeColors.textPrimary} fill={themeColors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                togglePlay()
              }}
              hitSlop={16}
              style={({ pressed }) => [
                styles.bigPlayBtn,
                {
                  backgroundColor: '#F59E0B',
                  shadowColor: '#F59E0B',
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                },
              ]}
            >
              {isPlaying ? (
                <Pause size={36} color="#000" fill="#000" strokeWidth={2.6} />
              ) : (
                <Play size={36} color="#000" fill="#000" strokeWidth={2.6} style={{ marginLeft: 4 }} />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                hapticLight()
                next()
              }}
              hitSlop={14}
              style={({ pressed }) => [
                styles.mainCtrl,
                { opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
              ]}
            >
              <SkipForward size={34} color={themeColors.textPrimary} fill={themeColors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => {
                hapticSel()
                toggleRepeat()
              }}
              hitSlop={10}
              style={({ pressed }) => [
                styles.mainCtrl,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              {repeat === 'one' ? (
                <Repeat1 size={22} color={themeColors.accent} strokeWidth={2.4} />
              ) : (
                <Repeat
                  size={22}
                  color={repeat !== 'off' ? themeColors.accent : themeColors.textSecondary}
                  strokeWidth={repeat !== 'off' ? 2.4 : 2}
                />
              )}
            </Pressable>
          </View>

          <View style={styles.secondaryControls}>
            <GlassCard variant="button" style={styles.speedBtn} intensity={12}>
              <Pressable
                onPress={() => {
                  hapticSel()
                  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
                  const idx = speeds.indexOf(speed)
                  setSpeed(speeds[(idx + 1) % speeds.length] ?? 1)
                }}
                style={styles.pad}
                hitSlop={8}
              >
                <Gauge size={14} color={themeColors.textSecondary} strokeWidth={2} />
                <Text style={[styles.speedText, { color: themeColors.textPrimary }]}>
                  {speed}x
                </Text>
              </Pressable>
            </GlassCard>

            <Pressable
              onPress={async () => {
                hapticLight()
                if (!track || downloaded || downloading) return
                setDownloading(true)
                setDownloadPct(0)
                try {
                  await downloadTrackForOffline(track, 'STANDARD', (p) => setDownloadPct(p))
                  setDownloaded(true)
                } catch (e) {
                  // silent
                } finally {
                  setDownloading(false)
                }
              }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconOnlyBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              {downloaded ? (
                <CheckCircle size={22} color="#F59E0B" fill="#F59E0B22" />
              ) : downloading ? (
                <Text style={[styles.dlPct, { color: themeColors.textPrimary }]}>
                  {Math.round(downloadPct * 100)}%
                </Text>
              ) : (
                <Download size={22} color={themeColors.textSecondary} strokeWidth={2} />
              )}
            </Pressable>

            <Pressable
              onPress={() => hapticSel()}
              style={({ pressed }) => [
                styles.iconOnlyBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={8}
            >
              <Share2 size={22} color={themeColors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={styles.volumeRow}>
            <Volume2 size={16} color={themeColors.textMuted} strokeWidth={2} />
            <Slider
              value={muted ? 0 : volume}
              minimumValue={0}
              maximumValue={1}
              onValueChange={setVolume}
              minimumTrackTintColor={themeColors.accent}
              maximumTrackTintColor="rgba(255,255,255,0.22)"
              thumbTintColor="#fff"
              style={styles.volSlider}
              tapToSeek
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerMeta: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerAlbum: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    maxWidth: '85%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  coverWrap: {
    borderRadius: 24,
  },
  coverCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  coverArt: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  metaContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  artist: {
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  sliderWrap: {
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  mainCtrl: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  bigPlayBtn: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 4,
    gap: 12,
  },
  speedBtn: {
    minWidth: 92,
    height: 36,
  },
  pad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 6,
    height: '100%',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '800',
  },
  iconOnlyBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  dlPct: {
    fontSize: 12,
    fontWeight: '700',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
    marginTop: 4,
  },
  volSlider: {
    flex: 1,
    height: 28,
  },
})
