import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { Search as SearchIcon, Play, Heart, Download, Music2 } from 'lucide-react-native'
import { useMobilePlayer, downloadTrackForOffline, isTrackDownloaded } from '@/store/useMobilePlayer'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'

export default function SearchScreen() {
  const { themeColors } = useTheme()
  const [query, setQuery] = useState('')
  const [liveTracks, setLiveTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'TRACKS' | 'ARTISTS'>('ALL')

  const play = useMobilePlayer((s) => s.play)
  const currentTrack = useMobilePlayer((s) => s.currentTrack)

  useEffect(() => {
    const targetQuery = query.trim() || 'Trending Music Songs'

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await fetch(`https://gaansuni.pages.dev/api/live-search?q=${encodeURIComponent(targetQuery)}&limit=25`)
        if (res.ok) {
          const data = await res.json()
          if (data.tracks && Array.isArray(data.tracks)) setLiveTracks(data.tracks)
        }
      } catch (e) {
        console.warn('Mobile search fetch error:', e)
      } finally {
        setLoading(false)
      }
    }, query.trim() ? 400 : 0)

    return () => clearTimeout(timer)
  }, [query])

  const handlePlayTrack = (track: any, idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    play(track, liveTracks.map((t) => ({ trackId: t.id, track: t })), idx)
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Search
        </Text>

        {/* SEARCH INPUT */}
        <GlassCard style={styles.searchBox}>
          <SearchIcon size={20} color="#F59E0B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
          />
          {loading && <ActivityIndicator size="small" color="#F59E0B" />}
        </GlassCard>

        {/* FILTER PILLS */}
        <View style={styles.pillRow}>
          {(['ALL', 'TRACKS', 'ARTISTS'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                Haptics.selectionAsync()
                setFilter(f)
              }}
              style={[styles.pill, filter === f && styles.pillActive]}
            >
              <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
                {f === 'ALL' ? 'All' : f === 'TRACKS' ? 'Songs' : 'Artists'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* RESULTS LIST */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {liveTracks.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Music2 size={36} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>Search Gaansuni Catalog</Text>
              <Text style={styles.emptyText}>
                Type any track name or artist to find 100% full-length 320kbps songs.
              </Text>
            </GlassCard>
          ) : (
            liveTracks.map((t, idx) => {
              const isPlaying = currentTrack?.id === t.id
              const isDl = isTrackDownloaded(t.id)
              return (
                <Pressable
                  key={t.id}
                  onPress={() => handlePlayTrack(t, idx)}
                  style={[styles.trackRow, isPlaying && styles.trackRowActive]}
                >
                  <Image source={{ uri: t.album?.coverArtUrl }} style={styles.thumb} />
                  <View style={styles.trackInfo}>
                    <Text numberOfLines={1} style={[styles.trackTitle, { color: isPlaying ? '#F59E0B' : '#FFF' }]}>
                      {t.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.artistName}>
                      {t.artist?.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      await downloadTrackForOffline(t)
                    }}
                    style={styles.iconBtn}
                  >
                    <Download size={18} color={isDl ? '#F59E0B' : 'rgba(255,255,255,0.5)'} />
                  </Pressable>
                </Pressable>
              )
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, gap: 14, flex: 1 },
  title: { fontSize: 26, fontWeight: '800' },
  searchBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
  },
  input: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillActive: { backgroundColor: '#F59E0B' },
  pillText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  pillTextActive: { color: '#000' },
  listContainer: { gap: 10, paddingBottom: 100 },
  emptyCard: { padding: 28, alignItems: 'center', gap: 10, borderRadius: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  emptyText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 18 },
  trackRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 12 },
  trackRowActive: { borderWidth: 1, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)' },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontWeight: '700' },
  artistName: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  iconBtn: { padding: 8 },
})
