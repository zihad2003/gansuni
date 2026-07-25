import { Stack } from 'expo-router'
import { useTheme } from '@/providers/ThemeProvider'

export default function RootLayout() {
  const { themeColors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        navigationBarColor: themeColors.gradientTo,
        statusBarStyle: 'light',
        statusBarTranslucent: true,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="player" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
