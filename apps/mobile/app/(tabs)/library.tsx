import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { Library, Music2 } from 'lucide-react-native'

export default function LibraryScreen() {
  const { themeColors } = useTheme()
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Your Library
        </Text>
        <GlassCard style={styles.card}>
          <Library size={24} color="#1DB954" />
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Library coming soon
          </Text>
          <Text style={[styles.cardText, { color: themeColors.textSecondary }]}>
            Playlists, liked songs and downloaded tracks.
          </Text>
        </GlassCard>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  card: { padding: 24, alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
})
