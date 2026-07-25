import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { Search } from 'lucide-react-native'

export default function SearchScreen() {
  const { themeColors } = useTheme()
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Search
        </Text>
        <GlassCard style={styles.searchBox}>
          <Search size={20} color={themeColors.textMuted} />
          <Text style={{ color: themeColors.textMuted }}>Songs, artists, albums...</Text>
        </GlassCard>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})
