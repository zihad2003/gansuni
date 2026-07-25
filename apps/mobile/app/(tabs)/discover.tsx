import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { GlassCard } from '@/components/GlassCard'
import { Sparkles } from 'lucide-react-native'

export default function DiscoverScreen() {
  const { themeColors } = useTheme()
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Discover
        </Text>
        <GlassCard style={styles.card}>
          <Sparkles size={24} color="#1DB954" />
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Discover coming soon
          </Text>
          <Text style={[styles.cardText, { color: themeColors.textSecondary }]}>
            AI-powered recommendations tailored for you.
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
