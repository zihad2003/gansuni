import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { User, Crown } from 'lucide-react-native'

export default function ProfileScreen() {
  const { themeColors } = useTheme()
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Profile
        </Text>
        <GlassCard variant="strong" style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: themeColors.dominant }]}>
            <User size={32} color="#fff" strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.name, { color: themeColors.textPrimary }]}>
                Music Lover
              </Text>
              <Crown size={14} color="#F59E0B" fill="#F59E0B" />
            </View>
            <Text style={[styles.email, { color: themeColors.textSecondary }]}>
              user@gansuni.app
            </Text>
          </View>
        </GlassCard>

        <View style={styles.stats}>
          <GlassCard style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>128</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Liked</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>12</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Playlists</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>4h</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Playtime</Text>
          </GlassCard>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 12, marginTop: 2 },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
})
