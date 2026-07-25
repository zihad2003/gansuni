import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { Library, Heart, Download, Music2, Play, Trash2, Wifi, WifiOff, Plus } from 'lucide-react-native'
import { useMobilePlayer, downloadTrackForOffline, isTrackDownloaded, removeDownloadedTrack } from '@/store/useMobilePlayer'
import { EXPANDED_TRACKS, FEATURED_PLAYLISTS, formatDuration } from '@gansuni/shared'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'

export default function LibraryScreen() {
  const { themeColors } = useTheme()
  const [tab, setTab] = useState<'LIKED' | 'DOWNLOADS' | 'PLAYLISTS'>('LIKED')

  const play = useMobilePlayer((s) => s.play)
  const currentTrack = useMobilePlayer((s) => s.currentTrack)
  const isOfflineMode = useMobilePlayer((s) => s.isOfflineMode)
  const setOfflineMode = useMobilePlayer((s) => s.setOfflineMode)
  const likedTrackIds = useMobilePlayer((s) => s.likedTrackIds)
  const downloadsMap = useMobilePlayer((s) => s._downloads)

  const likedTracks = EXPANDED_TRACKS.filter((t) => likedTrackIds.includes(t.id))
  const downloadedTrackIds = Array.from(downloadsMap.keys())
  const downloadedTracks = EXPANDED_TRACKS.filter((t) => downloadedTrackIds.includes(t.id))

  const handleToggleOffline = (val: boolean) => {
    Haptics.selectionAsync()
    setOfflineMode(val)
  }

  const handleDownloadTrack = async (t: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      if (isTrackDownloaded(t.id)) {
        await removeDownloadedTrack(t.id)
      } else {
        await downloadTrackForOffline(t)
      }
    } catch (e) {
      console.warn('Download toggle error:', e)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <Library size={24} color="#F59E0B" />
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Your Library
            </Text>
          </View>

          {/* OFFLINE MODE TOGGLE */}
          <View style={styles.offlineToggleRow}>
            {isOfflineMode ? <WifiOff size={18} color="#F59E0B" /> : <Wifi size={18} color="rgba(255,255,255,0.6)" />}
            <Text style={[styles.offlineText, { color: isOfflineMode ? '#F59E0B' : 'rgba(255,255,255,0.7)' }]}>
              Offline
            </Text>
            <Switch
              value={isOfflineMode}
              onValueChange={handleToggleOffline}
              trackColor={{ false: '#333', true: '#F59E0B' }}
              thumbColor={isOfflineMode ? '#000' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* TABS SELECTOR */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync()
              setTab('LIKED')
            }}
            style={[styles.tabButton, tab === 'LIKED' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === 'LIKED' && styles.tabTextActive]}>
              Liked ({likedTracks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync()
              setTab('DOWNLOADS')
            }}
            style={[styles.tabButton, tab === 'DOWNLOADS' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === 'DOWNLOADS' && styles.tabTextActive]}>
              Offline ({downloadedTracks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync()
              setTab('PLAYLISTS')
            }}
            style={[styles.tabButton, tab === 'PLAYLISTS' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === 'PLAYLISTS' && styles.tabTextActive]}>
              Playlists
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TAB 1: LIKED SONGS */}
        {tab === 'LIKED' && (
          <View style={styles.listContainer}>
            {likedTracks.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Heart size={36} color="rgba(255,255,255,0.3)" />
                <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Liked Songs Yet</Text>
                <Text style={styles.emptyText}>Tap the heart icon on any song to add it to your library.</Text>
              </GlassCard>
            ) : (
              likedTracks.map((t, idx) => {
                const isDl = isTrackDownloaded(t.id)
                const isPlaying = currentTrack?.id === t.id
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => play(t as any, likedTracks.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
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
                    <Pressable onPress={() => handleDownloadTrack(t)} style={styles.iconBtn}>
                      <Download size={18} color={isDl ? '#F59E0B' : 'rgba(255,255,255,0.5)'} />
                    </Pressable>
                  </Pressable>
                )
              })
            )}
          </View>
        )}

        {/* TAB 2: DOWNLOADED TRACKS */}
        {tab === 'DOWNLOADS' && (
          <View style={styles.listContainer}>
            {downloadedTracks.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Download size={36} color="#F59E0B" />
                <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>No Offline Downloads</Text>
                <Text style={styles.emptyText}>
                  Download songs using the download button to listen offline without internet connection.
                </Text>
              </GlassCard>
            ) : (
              downloadedTracks.map((t, idx) => {
                const isPlaying = currentTrack?.id === t.id
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => play(t as any, downloadedTracks.map((tr) => ({ trackId: tr.id, track: tr as any })), idx)}
                    style={[styles.trackRow, isPlaying && styles.trackRowActive]}
                  >
                    <Image source={{ uri: t.album?.coverArtUrl }} style={styles.thumb} />
                    <View style={styles.trackInfo}>
                      <Text numberOfLines={1} style={[styles.trackTitle, { color: isPlaying ? '#F59E0B' : '#FFF' }]}>
                        {t.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.artistName}>
                        {t.artist?.name} • Offline Saved
                      </Text>
                    </View>
                    <Pressable onPress={() => handleDownloadTrack(t)} style={styles.iconBtn}>
                      <Trash2 size={18} color="#F43F5E" />
                    </Pressable>
                  </Pressable>
                )
              })
            )}
          </View>
        )}

        {/* TAB 3: PLAYLISTS */}
        {tab === 'PLAYLISTS' && (
          <View style={styles.listContainer}>
            {FEATURED_PLAYLISTS.map((pl) => (
              <GlassCard key={pl.id} style={styles.playlistCard}>
                <Image source={{ uri: pl.coverArtUrl || undefined }} style={styles.plThumb} />
                <View style={styles.plInfo}>
                  <Text style={styles.plTitle}>{pl.name}</Text>
                  <Text numberOfLines={2} style={styles.plDesc}>
                    {pl.description}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, fontWeight: '800' },
  offlineToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  offlineText: { fontSize: 12, fontWeight: '700' },
  tabBar: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 12 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  tabButtonActive: { backgroundColor: '#F59E0B' },
  tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#000' },
  content: { padding: 16, paddingBottom: 100 },
  listContainer: { gap: 10 },
  emptyCard: { padding: 28, alignItems: 'center', gap: 12, borderRadius: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 18 },
  trackRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', gap: 12 },
  trackRowActive: { borderWidth: 1, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)' },
  thumb: { width: 46, height: 46, borderRadius: 8 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontWeight: '700' },
  artistName: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  iconBtn: { padding: 8 },
  playlistCard: { flexDirection: 'row', padding: 12, borderRadius: 16, gap: 14, alignItems: 'center' },
  plThumb: { width: 60, height: 60, borderRadius: 12 },
  plInfo: { flex: 1 },
  plTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  plDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
})
