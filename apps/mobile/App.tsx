import { ExpoRoot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { PlayerProvider } from '@/providers/PlayerProvider'

export default function App() {
  const ctx = (require as any).context('./app')

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PlayerProvider>
            <View style={styles.container}>
              <StatusBar style="light" translucent />
              <ExpoRoot context={ctx} />
            </View>
          </PlayerProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
