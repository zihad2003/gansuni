import React, { useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, withTiming, FadeInDown } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'
import { useMobilePlayer } from '@/store/useMobilePlayer'
import { GlassCard } from '@/components/GlassCard'
import { formatDuration, formatNumber, EXPANDED_TRACKS, FEATURED_PLAYLISTS, NEW_RELEASES, POPULAR_INTERNET_TRACKS } from '@gansuni/shared'
import {
  Play,
  Heart,
  Clock,
  Sparkles,
  Music2,
  ChevronRight,
  SkipForward,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_W } = Dimensions.get('screen')

const DEMO_TRACKS = EXPANDED_TRACKS

const QUICK_PICKS = [
  DEMO_TRACKS[0]!,
  DEMO_TRACKS[3]!,
  DEMO_TRACKS[4]!,
  DEMO_TRACKS[1]!,
  DEMO_TRACKS[2]!,
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { themeColors } = useTheme()
  const play = useMobilePlayer((s) => s.play)
  const currentTrackId = useMobilePlayer((s) => s.currentTrack?.id)
  const playbackState = useMobilePlayer((s) => s.playbackState)

  const onPlayTrack = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const track = DEMO_TRACKS[index]!
      play(
        track as any,
        DEMO_TRACKS.map((t) => ({ trackId: t.id, track: t as any })),
        index,
      )
    },
    [play],
  )

  const onPlayAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    const first = DEMO_TRACKS[0]!
    play(
      first as any,
      DEMO_TRACKS.map((t) => ({ trackId: t.id, track: t as any })),
      0,
    )
  }, [play])

  const onPlayPlaylist = useCallback(
    (trackIdx: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const track = DEMO_TRACKS[trackIdx]!
      play(
        track as any,
        DEMO_TRACKS.map((t) => ({ trackId: t.id, track: t as any })),
        trackIdx,
      )
    },
    [play],
  )

  const isPlaying = (trackId: string) =>
    currentTrackId === trackId && (playbackState === 'playing' || playbackState === 'buffering')

  const isCurrent = (trackId: string) => currentTrackId === trackId

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 180 },
        ]}
      >
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <View>
              <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>
                Assalamu Alaikum 👋
              </Text>
              <Text style={[styles.greetingName, { color: themeColors.textPrimary }]}>
                Gaansuni · Good to see you
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.avatarBtn,
                { backgroundColor: themeColors.surfaceBg, opacity: pressed ? 0.6 : 1, borderColor: themeColors.surfaceBorder },
              ]}
            >
              <Music2 size={20} color="#1DB954" />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(29,185,84,0.32)', 'rgba(139,92,246,0.28)', 'rgba(6, 182, 212, 0.22)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroInner}
            >
              <Sparkles size={18} color="#1DB954" style={styles.heroIcon} />
              <Text style={[styles.heroTitle, { color: themeColors.textPrimary }]}>
                Today&apos;s Top Bengali Picks
              </Text>
              <Text style={[styles.heroSubtitle, { color: themeColors.textSecondary }]}>
                Updated daily with the best of Bangladesh
              </Text>
              <Pressable
                onPress={onPlayAll}
                style={({ pressed }) => [
                  styles.heroPlayBtn,
                  {
                    backgroundColor: '#1DB954',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Play size={20} color="#000" fill="#000" style={{ marginLeft: 2 }} />
                <Text style={styles.heroPlayText}>Play mix</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(80).springify()} style={styles.section}>
          <SectionHeader title="Quick picks" accent={themeColors.accent} />
          <View style={styles.quickGrid}>
            {QUICK_PICKS.map((t, idx) => {
              const playing = isPlaying(t.id)
              return (
                <Pressable
                  key={`qp-${t.id}`}
                  onPress={() => onPlayPlaylist(DEMO_TRACKS.findIndex((x) => x.id === t.id))}
                  style={({ pressed }) => [
                    styles.quickPick,
                    {
                      backgroundColor: themeColors.surfaceBg,
                      borderColor: themeColors.surfaceBorder,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: t.album.coverArtUrl }}
                    style={styles.qpCover}
                    contentFit="cover"
                  />
                  <View style={styles.qpMeta}>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.qpTitle,
                        { color: isCurrent(t.id) ? '#1DB954' : themeColors.textPrimary },
                      ]}
                    >
                      {t.title}
                    </Text>
                    <Text numberOfLines={1} style={[styles.qpArtist, { color: themeColors.textSecondary }]}>
                      {t.artist.name}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.qpPlay,
                      {
                        backgroundColor: playing ? '#1DB954' : 'rgba(255,255,255,0.15)',
                        opacity: pressed || playing ? 1 : 0,
                      },
                    ]}
                  >
                    {playing ? (
                      <View style={styles.miniEq}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={styles.miniEqBar} />
                        ))}
                      </View>
                    ) : (
                      <Play size={14} fill="#fff" strokeWidth={0} color="#fff" style={{ marginLeft: 1 }} />
                    )}
                  </View>
                </Pressable>
              )
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(160).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader title="Featured playlists" accent={themeColors.accent} />
            <ChevronRight size={20} color={themeColors.textMuted} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {FEATURED_PLAYLISTS.map((pl, i) => (
              <Pressable
                key={pl.id}
                onPress={() => onPlayPlaylist(i % DEMO_TRACKS.length)}
                style={({ pressed }) => [
                  styles.playlistCard,
                  {
                    backgroundColor: themeColors.surfaceBg,
                    borderColor: themeColors.surfaceBorder,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View style={styles.playlistCoverWrap}>
                  <Image
                    source={{ uri: pl.coverArtUrl }}
                    style={styles.playlistCover}
                    contentFit="cover"
                  />
                  <View style={styles.playlistPlayOverlay}>
                    <View style={styles.playlistPlayBtn}>
                      <Play size={18} fill="#000" strokeWidth={0} color="#000" style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                </View>
                <View style={styles.playlistMeta}>
                  <Text numberOfLines={1} style={[styles.playlistName, { color: themeColors.textPrimary }]}>
                    {pl.name}
                  </Text>
                  <Text numberOfLines={2} style={[styles.playlistDesc, { color: themeColors.textMuted }]}>
                    {pl.description}
                  </Text>
                  <Text style={[styles.playlistCount, { color: themeColors.textSecondary }]}>
                    {pl.trackCount} songs
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(240).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionHeader title="Popular tracks" accent={themeColors.accent} />
            <Pressable onPress={onPlayAll} hitSlop={10}>
              <Text style={[styles.seeAll, { color: themeColors.textSecondary }]}>
                Play all
              </Text>
            </Pressable>
          </View>

          <GlassCard variant="strong" style={styles.tracklistCard}>
            {DEMO_TRACKS.map((t, idx) => {
              const playing = isPlaying(t.id)
              const active = isCurrent(t.id)
              return (
                <Pressable
                  key={t.id}
                  onPress={() => onPlayTrack(idx)}
                  style={({ pressed }) => [
                    styles.trackRow,
                    {
                      borderBottomColor: 'rgba(255,255,255,0.06)',
                      backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
                    },
                    idx < DEMO_TRACKS.length - 1 && styles.trackRowBorder,
                  ]}
                >
                  <View style={styles.trackIndex}>
                    {playing ? (
                      <View style={styles.rowEq}>
                        {[0, 1, 2].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.rowEqBar,
                              { backgroundColor: active ? '#1DB954' : themeColors.textPrimary },
                            ]}
                          />
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.trackNum, { color: active ? '#1DB954' : themeColors.textMuted }]}>
                        {idx + 1}
                      </Text>
                    )}
                  </View>

                  <Image
                    source={{ uri: t.album.coverArtUrl }}
                    style={styles.trackCover}
                    contentFit="cover"
                  />

                  <View style={styles.trackMeta}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.trackTitle,
                        { color: active ? '#1DB954' : themeColors.textPrimary },
                      ]}
                    >
                      {t.title}
                    </Text>
                    <Text numberOfLines={1} style={[styles.trackArtist, { color: themeColors.textSecondary }]}>
                      {t.artist.name}
                    </Text>
                  </View>

                  <View style={styles.trackRight}>
                    <Heart
                      size={16}
                      color={themeColors.textMuted}
                      strokeWidth={1.8}
                      style={{ opacity: 0.6 }}
                    />
                    <View style={styles.trackTime}>
                      <Clock size={12} color={themeColors.textMuted} strokeWidth={1.8} />
                      <Text style={[styles.timeText, { color: themeColors.textMuted }]}>
                        {formatDuration(t.durationMs)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </GlassCard>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textMuted }]}>
            Gaansuni · © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

function SectionHeader({ title, accent }: { title: string; accent: string }) {
  const { themeColors } = useTheme()
  return (
    <View style={styles.secHeader}>
      <View style={[styles.secAccent, { backgroundColor: '#1DB954' }]} />
      <Text style={[styles.secTitle, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    gap: 16,
    marginBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  hero: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
  },
  heroInner: {
    padding: 20,
    paddingTop: 18,
    gap: 6,
  },
  heroIcon: {
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  heroPlayBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginTop: 12,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroPlayText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13.5,
  },
  section: {
    marginTop: 26,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontSize: 12.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  secTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickPick: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qpCover: {
    width: 52,
    height: 52,
  },
  qpMeta: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 2,
    minWidth: 0,
  },
  qpTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 16,
  },
  qpArtist: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  qpPlay: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniEq: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 12,
  },
  miniEqBar: {
    width: 2,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  horizontalScroll: {
    paddingRight: 16,
    paddingLeft: 2,
    paddingVertical: 4,
    gap: 14,
  },
  playlistCard: {
    width: 160,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  playlistCoverWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  playlistCover: {
    width: '100%',
    height: '100%',
  },
  playlistPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 8,
    opacity: 0.95,
  },
  playlistPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playlistMeta: { gap: 2, paddingHorizontal: 2 },
  playlistName: { fontSize: 13.5, fontWeight: '800' },
  playlistDesc: { fontSize: 11, lineHeight: 14, marginTop: 1 },
  playlistCount: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  tracklistCard: {
    padding: 0,
    overflow: 'hidden',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  trackRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trackIndex: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowEq: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  rowEqBar: {
    width: 2.5,
    height: 12,
    borderRadius: 1.5,
  },
  trackCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  trackMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackArtist: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  trackRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  trackTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    marginTop: 36,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
